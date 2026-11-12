import { linkRepository } from "./lawyer-secretary-links.repository.js";
import { userRepository } from "../user/user.repositories.js";
import type {
  LinkInput,
  EndLinkInput,
  UpdateBodyLinkInput,
  UpdateParamsLinkInput,
  CancelParamsLinkInput,
  CancelBodyLinkInput
} from "./lawyer-secretary-links.schema.js";
import { AppError } from "../../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../../generated/prisma/enums.js";
import { LawyerSecretaryLink } from "../../generated/prisma/client.js";

async function findLinkOrThrow(id: string) {
  const link = await linkRepository.findById(id);

  if (!link) {
    throw new AppError(
      "Vínculo não encontrado.",
      StatusCodes.NOT_FOUND,
      "NOT_FOUND_LINK",
    );
  }

  return link;
}

function ensureLinkNotCancelled(link: LawyerSecretaryLink): void {
  if (link.canceledAt !== null) {
    throw new AppError(
      "O vínculo não pode ser modificado, porque ele está cancelado.",
      StatusCodes.CONFLICT,
      "LINK_ALREADY_CANCELED",
    );
  }
}

function ensureLinkIsntFinished(link: LawyerSecretaryLink, today: Date): void {
  if (link.endDate !== null && link.endDate < today) {
    throw new AppError(
      "O vínculo não pode ser alterado, porque ele já terminou.",
      StatusCodes.CONFLICT,
      "LINK_ALREADY_ENDED",
    );
  }
}

function ensureValidLinkRange(startDate: Date, endDate: Date | null): void {
  if (endDate && endDate < startDate) {
    throw new AppError(
      "A data final não pode ser anterior à data de início",
      StatusCodes.UNPROCESSABLE_ENTITY,
      "INVALID_DATE_RANGE",
    );
  }
}

function ensureLinkWasUpdated(count: number): void {
  if (count === 0) {
    throw new AppError(
      "O vínculo não pôde ser atualizado. Verifique se ele existe, está ativo e ainda pode ser modificado.",
      StatusCodes.CONFLICT,
      "LINK_NOT_MODIFIABLE",
    );
  }
}

function ensureLinkHasStarted(link: LawyerSecretaryLink, today: Date): void {
  if (link.startDate > today) {
    throw new AppError(
      "O vínculo ainda não começou e não pode ser encerrado.",
      StatusCodes.CONFLICT,
      "LINK_NOT_STARTED",
    );
  }
}

function normalizeDate(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  
  return date;
}

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

    ensureValidLinkRange(startDate, endDate);

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

  async endLink(input: EndLinkInput) {
    const link = await findLinkOrThrow(input.id);

    ensureLinkNotCancelled(link);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    ensureLinkHasStarted(link, today);

    ensureLinkIsntFinished(link, today);

    const result = await linkRepository.endLink(input, new Date());

    ensureLinkWasUpdated(result);

    return;
  },

  async updateLink(
    { endDate }: UpdateBodyLinkInput,
    { id }: UpdateParamsLinkInput,
  ) {
    const link = await findLinkOrThrow(id);

    ensureLinkNotCancelled(link);

    const today = normalizeDate();

    ensureLinkIsntFinished(link, today);

    ensureValidLinkRange(link.startDate, endDate);

    const result = await linkRepository.updateLink({ id }, { endDate }, today);

    ensureLinkWasUpdated(result);

    return;
  },

  async cancelLink(params: CancelParamsLinkInput, input : CancelBodyLinkInput, canceledByID: string) {
    const link = await findLinkOrThrow(params.id);

    ensureLinkNotCancelled(link);

    const today = normalizeDate();

    ensureLinkIsntFinished(link, today); 
    
    const result = await linkRepository.cancelLink(params, today, input, canceledByID);

    ensureLinkWasUpdated(result);
    
    return;
  }
};
