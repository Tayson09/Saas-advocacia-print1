import { linkRepository } from "./lawyer-secretary-links.repository.js";
import { userRepository } from "../user/user.repositories.js";
import type {
  LinkInput,
  EndLinkInput,
} from "./lawyer-secretary-links.schema.js";
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
  },

  async  endLink(input: EndLinkInput) {
    const link = await linkRepository.findById(input.id);

    if (!link) {
      throw new AppError(
        "Vínculo não encontrado.",
        StatusCodes.NOT_FOUND,
        "NOT_FOUND_LINK",
      );
    }

    if (link.canceledAt !== null) {
      throw new AppError(
        "O vínculo não pode ser encerrado, porque ele está cancelado.",
        StatusCodes.CONFLICT,
        "LINK_ALREADY_CANCELED",
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0)

    if (link.endDate !== null && link.endDate < today ) {
      throw new AppError(
        "O vínculo não pode ser encerrado, porque ele já terminou.",
        StatusCodes.CONFLICT,
        "LINK_ALREADY_ENDED",
      );
    }

    const result = await linkRepository.endLink(input, new Date());

    if (result === 0) {
      throw new AppError(
        "O vínculo não pode ser encerrado, porque ele já terminou.",
        StatusCodes.CONFLICT,
        "LINK_ALREADY_ENDED",
      );
    }

    return;
  },
};
