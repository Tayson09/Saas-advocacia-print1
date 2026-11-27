import crypto from "node:crypto";
import argon2 from "argon2";
import { userRepository } from "../user/user.repositories.js";
import {
  type LoginInput,
  type refreshInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./auth.schema.js";
import { AppError } from "../../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import * as tokenService from "../token/token.service.js";
import { TokenRepository } from "../token/token.repositoy.js";
import { randomUUID } from "node:crypto";
import { auditRepository } from "../audit/audit.repository.js";
import { prisma } from "../../lib/prisma.js";
import { sendPasswordResetEmail } from "../../lib/email.service.js";

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

const invalidRefreshToken = () =>
  new AppError(
    "Refresh token inválido ou expirado",
    StatusCodes.UNAUTHORIZED,
    "INVALID_REFRESH_TOKEN",
  );

const invalidResetToken = () =>
  new AppError(
    "Link de redefinição inválido ou expirado",
    StatusCodes.BAD_REQUEST,
    "INVALID_PASSWORD_RESET_TOKEN",
  );

async function handleReuse(familyId: string, userId: string, ip?: string) {
  const { count } = await TokenRepository.revokeFamily(familyId);
  await auditRepository.log({
    action:
      count > 0
        ? "REFRESH_TOKEN_REUSE_FAMILY_REVOKED"
        : "REFRESH_TOKEN_REUSE_ATTEMPT",
    userId,
    ip,
  });
}

export const AuthService = {
  async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(input.email);

    if (!user) {
      throw new AppError(
        "Usuário não encontrado",
        StatusCodes.NOT_FOUND,
        "AUTH_USER_NOT_FOUND",
      );
    }

    const isValidPassoword = await argon2.verify(
      user.passwordHash,
      input.password,
    );

    if (!isValidPassoword) {
      throw new AppError(
        "Senha incorreta",
        StatusCodes.UNAUTHORIZED,
        "AUTH_INVALID_PASSWORD",
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "Acesso bloqueado. Entre em contato com o administrador.",
        StatusCodes.FORBIDDEN,
        "USER_ACCOUNT_DISABLED",
      );
    }

    const accessToken = tokenService.generateAccessToken(user);
    const refreshRawToken = tokenService.generateRefreshToken();
    const refreshHashToken = tokenService.hashRefreshToken(refreshRawToken);

    await TokenRepository.createRefreshToken({
      userId: user.id,
      familyId: randomUUID(),
      tokenHash: refreshHashToken,
      expiresAt: new Date(Date.now() + tokenService.REFRESH_TOKEN_TTL_MS),
      sessionExpiresAt: new Date(
        Date.now() + tokenService.SESSION_MAX_LIFETIME_MS,
      ),
    });

    return {
      accessToken,
      refreshRawToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        officeId: user.officeId,
      },
    };
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
    if (
      !sessionExpiresAt ||
      stored.expiresAt <= now ||
      sessionExpiresAt <= now
    ) {
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
      officeId: stored.user.officeId,
    });
    const newRefreshToken = tokenService.generateRefreshToken();
    const newExpiresAt = new Date(
      Math.min(
        now.getTime() + tokenService.REFRESH_TOKEN_TTL_MS,
        sessionExpiresAt.getTime(),
      ),
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
        tx,
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

  // Solicita redefinição de senha. Responde sempre da mesma forma (não revela se o e-mail existe).
  async requestPasswordReset(input: ForgotPasswordInput, ip?: string) {
    const user = await userRepository.findByEmailWithPassword(input.email);

    // Só envia se a conta existe e está ativa. Em qualquer caso, não lança erro.
    if (!user || !user.isActive) return;

    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    await prisma.$transaction(async (tx) => {
      // invalida links de reset anteriores ainda válidos
      await userRepository.invalidatePasswordResetTokens(user.id, tx);
      await userRepository.createPasswordResetToken(
        { userId: user.id, tokenHash, expiresAt },
        tx,
      );
      await auditRepository.log(
        { action: "PASSWORD_RESET_REQUESTED", userId: user.id, ip },
        tx,
      );
    });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: rawToken,
      });
    } catch (error) {
      // falha de envio não deve revelar nada ao cliente; registra para diagnóstico
      console.error("Falha ao enviar e-mail de redefinição de senha", error);
    }
  },

  // Redefine a senha a partir do token recebido por e-mail.
  async resetPassword(input: ResetPasswordInput, ip?: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(input.token)
      .digest("hex");
    const resetToken = await userRepository.findPasswordResetByHash(tokenHash);

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date()
    ) {
      throw invalidResetToken();
    }

    const passwordHash = await argon2.hash(input.password);

    await prisma.$transaction(async (tx) => {
      const consumed = await userRepository.consumePasswordResetToken(
        resetToken.id,
        tx,
      );
      if (consumed.count !== 1) throw invalidResetToken();

      const updated = await tx.user.updateMany({
        where: { id: resetToken.userId, isActive: true },
        data: {
          passwordHash,
          // garante a conta ativada caso o usuário nunca tenha concluído o primeiro acesso
          passwordSetupCompletedAt:
            resetToken.user.passwordSetupCompletedAt ?? new Date(),
        },
      });

      if (updated.count !== 1) throw invalidResetToken();

      // encerra todas as sessões ativas: quem sabia a senha antiga perde o acesso
      await TokenRepository.revokeAllForUser(resetToken.userId, tx);
      await auditRepository.log(
        { action: "PASSWORD_RESET_COMPLETED", userId: resetToken.userId, ip },
        tx,
      );
    });
  },
};
