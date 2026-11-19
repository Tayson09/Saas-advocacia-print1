import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service.js";

export const AuthController = {
  async login(req: Request, res: Response) {
    const user = await AuthService.login(req.body);
    res.status(StatusCodes.OK).json(user);
  },

  async refresh(req: Request, res: Response) {
    res.status(StatusCodes.OK).json(await AuthService.refresh(req.body, req.ip));
  },

  async forgotPassword(req: Request, res: Response) {
    await AuthService.requestPasswordReset(req.body, req.ip);
    // resposta genérica: não revela se o e-mail existe
    res.status(StatusCodes.OK).json({
      message: "Se houver uma conta com este e-mail, enviaremos um link para redefinir a senha.",
    });
  },

  async resetPassword(req: Request, res: Response) {
    await AuthService.resetPassword(req.body, req.ip);
    res.status(StatusCodes.OK).json({ message: "Senha redefinida com sucesso!" });
  }
};