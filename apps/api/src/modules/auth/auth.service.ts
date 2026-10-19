import argon2 from "argon2";
import { userRepository } from "../user/user.repositories.js"
import { type LoginInput, type refreshInput } from "./auth.schema.js"
import { AppError } from "../../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import * as tokenService from "../token/token.service.js";
import { TokenRepository } from "../token/token.repositoy.js";
import { randomUUID } from "node:crypto";
import { auditRepository } from "../audit/audit.repository.js";
import { prisma } from "../../lib/prisma.js";

const invalidRefreshToken = () =>
  new AppError("Refresh token inválido ou expirado", StatusCodes.UNAUTHORIZED, "INVALID_REFRESH_TOKEN");

async function handleReuse(familyId: string, userId: string, ip?: string) {
  const { count } = await TokenRepository.revokeFamily(familyId);
  await auditRepository.log({
    action: count > 0 ? "REFRESH_TOKEN_REUSE_FAMILY_REVOKED" : "REFRESH_TOKEN_REUSE_ATTEMPT",
    userId,
    ip,
  });
}

export const AuthService = {
  async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(input.email);

    if (!user) {
      throw new AppError("E-mail ou senha incorretos", StatusCodes.UNAUTHORIZED, "AUTH_INVALID_CREDENTIALS");
    }

    const isValidPassoword = await argon2.verify(user.passwordHash, input.password);

    if (!isValidPassoword) {
      throw new AppError("E-mail ou senha incorretos", StatusCodes.UNAUTHORIZED, "AUTH_INVALID_CREDENTIALS");
    }

    if (!user.isActive) {
      throw new AppError("Acesso bloqueado. Entre em contato com o administrador.", StatusCodes.FORBIDDEN, "USER_ACCOUNT_DISABLED");
    }

    const accessToken = tokenService.generateAccessToken(user);
    const refreshRawToken = tokenService.generateRefreshToken();
    const refreshHashToken = tokenService.hashRefreshToken(refreshRawToken);

    await TokenRepository.createRefreshToken({
      userId: user.id,
      familyId: randomUUID(),
      tokenHash: refreshHashToken,
      expiresAt: new Date(Date.now() + tokenService.REFRESH_TOKEN_TTL_MS),
      sessionExpiresAt: new Date(Date.now() + tokenService.SESSION_MAX_LIFETIME_MS)
    });

    return { 
      accessToken, 
      refreshRawToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      } 
    }
  },

  async refresh(input: refreshInput, ip?: string) {
    const now = new Date();

    const tokenHash = tokenService.hashRefreshToken(input.refreshToken);
    const stored = await TokenRepository.findByHash(tokenHash);

    if (!stored) throw invalidRefreshToken();

    // reuso: já consumido (vem antes da checagem de revogação)
    if (stored.usedAt) {
      await handleReuse(stored.familyId, stored.userId, ip);
      throw invalidRefreshToken();
    }

    // revogado sem uso (logout etc.): só recusa
    if (stored.revokedAt) throw invalidRefreshToken();

    // sessionExpiresAt nulo (registro legado) = inválido
    const sessionExpiresAt = stored.sessionExpiresAt;
    if (!sessionExpiresAt || stored.expiresAt <= now || sessionExpiresAt <= now) {
      throw invalidRefreshToken();
    }

    if (!stored.user.isActive) {
      await TokenRepository.revokeFamily(stored.familyId);
      await auditRepository.log({
        action: "REFRESH_DENIED_INACTIVE_USER",
        userId: stored.userId,
        ip,
      });
      throw invalidRefreshToken();
    }

    // tudo que pode falhar sem efeito colateral, antes de mudar estado
    const accessToken = tokenService.generateAccessToken({
      id: stored.user.id,
      role: stored.user.role,
      name: stored.user.name,
    });
    const newRefreshToken = tokenService.generateRefreshToken();
    const newExpiresAt = new Date(
      Math.min(now.getTime() + tokenService.REFRESH_TOKEN_TTL_MS, sessionExpiresAt.getTime())
    );

    const rotated = await prisma.$transaction(async (tx) => {
      const consumed = await TokenRepository.markAsUsed(stored.id, now, tx);
      if (!consumed) return false; // perdeu a disputa

      const created = await TokenRepository.createRefreshToken(
        {
          userId: stored.userId,
          familyId: stored.familyId,
          tokenHash: tokenService.hashRefreshToken(newRefreshToken),
          expiresAt: newExpiresAt,
          sessionExpiresAt, // herdado, nunca renovado
        },
        tx
      );

      await TokenRepository.setReplacedBy(stored.id, created.id, tx);
      return true;
    });

    if (!rotated) {
      // reler para classificar pelo estado atual
      const current = await TokenRepository.findByHash(tokenHash);
      if (current?.usedAt) {
        await handleReuse(current.familyId, current.userId, ip);
      }
      throw invalidRefreshToken();
    }

    return { accessToken, refreshToken: newRefreshToken };
  },
}