import { linkRepository } from "./lawyer-secretary-links.repository.js";
import { userRepository } from "../user/user.repositories.js";
import type { LinkInput } from "./lawyer-secretary-links.schema.js";
import { AppError } from "../../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../../generated/prisma/enums.js";

export const linkService = {
  async create(input: LinkInput) {
    const { lawyerId, secretaryId, startDate, endDate } = input;

    if (lawyerId === secretaryId) {
      throw new AppError(
        "Os dois ids não podem ser iguais entre si.",
        StatusCodes.UNPROCESSABLE_ENTITY,
        "SAME_LAWYER_SECRETARY_ID",
      );
    }

    if (endDate && endDate < startDate) {
      throw new AppError(
        "A data final não pode ser anterior à data de início",
        StatusCodes.UNPROCESSABLE_ENTITY,
        "INVALID_DATE_RANGE",
      );
    }

    const [lawyer, secretary] = await Promise.all([
      userRepository.findForAuthorization(lawyerId),
      userRepository.findForAuthorization(secretaryId),
    ]);

    if (!lawyer) {
      throw new AppError(
        "Usuário não encontrado",
        StatusCodes.NOT_FOUND,
        "LAWYER_NOT_FOUND",
      );
    }

    if (!secretary) {
      throw new AppError(
        "Usuário não encontrado",
        StatusCodes.NOT_FOUND,
        "SECRETARY_NOT_FOUND",
      );
    }

    if (!lawyer.isActive) {
      throw new AppError(
        "Usuário inativo",
        StatusCodes.UNPROCESSABLE_ENTITY,
        "INACTIVE_LAWYER",
      );
    }

    if (!secretary.isActive) {
      throw new AppError(
        "Usuário inativo",
        StatusCodes.UNPROCESSABLE_ENTITY,
        "INACTIVE_SECRETARY",
      );
    }

    if (lawyer.role !== UserRole.ADMIN && lawyer.role !== UserRole.LAWYER) {
      throw new AppError(
        "Usuário não possui o papel adequado",
        StatusCodes.UNPROCESSABLE_ENTITY,
        "INVALID_LAWYER_ROLE",
      );
    }

    if (secretary.role !== UserRole.SECRETARY) {
      throw new AppError(
        "Usuário não possui o papel adequado",
        StatusCodes.UNPROCESSABLE_ENTITY,
        "INVALID_SECRETARY_ROLE",
      );
    }

    return linkRepository.create(input);
  },

  list() {
    return linkRepository.list();
  }
};
