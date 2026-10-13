import { StatusCodes } from "http-status-codes";
import { AppError } from "./app-error.js";

export interface ValidationIssue {
  location: "body" | "params" | "query";
  path: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(public readonly details: ValidationIssue[]) {
    super("Dados inválidos", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }
}