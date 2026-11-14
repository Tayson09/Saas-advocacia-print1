import { linkService } from "../../src/modules/lawyer-secretary-links/lawyer-secretary-links.service.js";
import type { LinkInput } from "../../src/modules/lawyer-secretary-links/lawyer-secretary-links.schema.js";
import { UserRole } from "../../src/generated/prisma/enums.js";
import type { LawyerSecretaryLink } from "../../src/generated/prisma/client.js";
import type {
  UpdateBodyLinkInput,
  UpdateParamsLinkInput,
} from "../../src/modules/lawyer-secretary-links/lawyer-secretary-links.schema.js";

const mocks = vi.hoisted(() => ({
  findForAuthorization: vi.fn(),
  createLink: vi.fn(),
  findLinkById: vi.fn(),
  updateLink: vi.fn(),
}));

vi.mock("../../src/modules/user/user.repositories.js", () => ({
  userRepository: {
    findForAuthorization: mocks.findForAuthorization,
  },
}));

vi.mock(
  "../../src/modules/lawyer-secretary-links/lawyer-secretary-links.repository.js",
  () => ({
    linkRepository: {
      create: mocks.createLink,
      findById: mocks.findLinkById,
      updateLink: mocks.updateLink,
    },
  }),
);

function makeLink(
  overrides: Partial<LawyerSecretaryLink> = {},
): LawyerSecretaryLink {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 5);
  startDate.setHours(0, 0, 0, 0);

  return {
    id: "link-123",
    lawyerId: "lawyer-123",
    secretaryId: "secretary-123",
    startDate,
    endDate: null,
    cancellationReason: null,
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    canceledById: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LawyerSecretaryLinkService", () => {
  describe("create", () => {
    it("deve rejeitar a criação quando advogado e secretária possuem o mesmo ID", async () => {
      const input: LinkInput = {
        lawyerId: "user-123",
        secretaryId: "user-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 422,
        code: "SAME_LAWYER_SECRETARY_ID",
      });
    });

    it("advogado inexiste: deve consultar o repository e lançar LAWYER_NOT_FOUND", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "secretary-123",
          isActive: true,
          role: UserRole.SECRETARY,
        });

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 404,
        code: "LAWYER_NOT_FOUND",
      });

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).not.toHaveBeenCalled();
    });

    it("secretária inexistente: deve consultar o repository e lançar SECRETARY_NOT_FOUND", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce({
          id: "lawyer-123",
          isActive: true,
          role: UserRole.LAWYER,
        })
        .mockResolvedValueOnce(null);

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 404,
        code: "SECRETARY_NOT_FOUND",
      });

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).not.toHaveBeenCalled();
    });

    it("advogado inativo: deve consultar o repository e lançar INACTIVE_LAWYER", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce({
          id: "lawyer-123",
          isActive: false,
          role: UserRole.LAWYER,
        })
        .mockResolvedValueOnce({
          id: "secretary-123",
          isActive: true,
          role: UserRole.SECRETARY,
        });

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 422,
        code: "INACTIVE_LAWYER",
      });

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).not.toHaveBeenCalled();
    });

    it("secretária inativa: deve consultar o repository e lançar INACTIVE_SECRETARY", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce({
          id: "lawyer-123",
          isActive: true,
          role: UserRole.LAWYER,
        })
        .mockResolvedValueOnce({
          id: "secretary-123",
          isActive: false,
          role: UserRole.SECRETARY,
        });

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 422,
        code: "INACTIVE_SECRETARY",
      });

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).not.toHaveBeenCalled();
    });

    it("advogado com papel distinto de LAWYER OU ADMIN: deve consultar o repository e lançar INVALID_LAWYER_ROLE", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce({
          id: "lawyer-123",
          isActive: true,
          role: UserRole.SECRETARY,
        })
        .mockResolvedValueOnce({
          id: "secretary-123",
          isActive: true,
          role: UserRole.SECRETARY,
        });

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 422,
        code: "INVALID_LAWYER_ROLE",
      });

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).not.toHaveBeenCalled();
    });

    it("secretária com papel distinto de SECRETARY: deve consultar o repository e lançar INVALID_SECRETARY_ROLE", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce({
          id: "lawyer-123",
          isActive: true,
          role: UserRole.LAWYER,
        })
        .mockResolvedValueOnce({
          id: "secretary-123",
          isActive: true,
          role: UserRole.LAWYER,
        });

      await expect(linkService.create(input)).rejects.toMatchObject({
        statusCode: 422,
        code: "INVALID_SECRETARY_ROLE",
      });

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).not.toHaveBeenCalled();
    });

    it("deve criar vínculo", async () => {
      const input: LinkInput = {
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
      };

      mocks.findForAuthorization
        .mockResolvedValueOnce({
          id: "lawyer-123",
          isActive: true,
          role: UserRole.LAWYER,
        })
        .mockResolvedValueOnce({
          id: "secretary-123",
          isActive: true,
          role: UserRole.SECRETARY,
        });

      mocks.createLink.mockResolvedValue({
        id: "link-123",
        lawyerId: "lawyer-123",
        secretaryId: "secretary-123",
        startDate: new Date("2026-11-13"),
        endDate: null,
        cancellationReason: null,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        canceledById: null,
      } satisfies LawyerSecretaryLink);

      const result = await linkService.create(input);

      expect(mocks.findForAuthorization).toHaveBeenCalledTimes(2);
      expect(mocks.createLink).toHaveBeenCalledWith(input);
      expect(result).toMatchObject(input);
    });
  });

  describe("update", () => {
    it("deve rejeitar a atualização quando o vínculo não existe", async () => {
      const params: UpdateParamsLinkInput = {
        id: "link-123",
      };

      const input: UpdateBodyLinkInput = {
        endDate: new Date("2026-12-20"),
      };

      mocks.findLinkById.mockResolvedValue(null);

      await expect(linkService.updateLink(input, params)).rejects.toMatchObject(
        {
          statusCode: 404,
          code: "NOT_FOUND_LINK",
        },
      );

      expect(mocks.updateLink).not.toHaveBeenCalled();
    });

    it("deve rejeitar a atualização quando o vínculo está cancelado", async () => {
      const params: UpdateParamsLinkInput = { id: "link-123" };
      const input: UpdateBodyLinkInput = { endDate: new Date("2026-12-20") };

      mocks.findLinkById.mockResolvedValue(
        makeLink({
          canceledAt: new Date(),
          cancellationReason: "erro ao criar vínculo",
        }),
      );

      await expect(linkService.updateLink(input, params)).rejects.toMatchObject(
        {
          statusCode: 409,
          code: "LINK_ALREADY_CANCELED",
        },
      );

      expect(mocks.updateLink).not.toHaveBeenCalled();
    });

    it("deve rejeitar a atualização quando o vínculo estiver finalizado", async () => {
      const params: UpdateParamsLinkInput = { id: "link-123" };
      const input: UpdateBodyLinkInput = { endDate: new Date("2026-12-20") };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      mocks.findLinkById.mockResolvedValue(
        makeLink({
          endDate: yesterday,
        }),
      );

      await expect(linkService.updateLink(input, params)).rejects.toMatchObject(
        {
          statusCode: 409,
          code: "LINK_ALREADY_ENDED",
        },
      );

      expect(mocks.updateLink).not.toHaveBeenCalled();
    });

    it("deve rejeitar a atualização quando  a data final for anterior à data inicial", async () => {
      const params: UpdateParamsLinkInput = { id: "link-123" };

      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 6);
      endDate.setHours(0, 0, 0, 0);

      const input: UpdateBodyLinkInput = { endDate };

      mocks.findLinkById.mockResolvedValue(makeLink());

      await expect(linkService.updateLink(input, params)).rejects.toMatchObject(
        {
          statusCode: 422,
          code: "INVALID_DATE_RANGE",
        },
      );

      expect(mocks.updateLink).not.toHaveBeenCalled();
    });

    it("deve aceitar a atualização quando a data final for null", async () => {
      const params: UpdateParamsLinkInput = { id: "link-123" };
      const input: UpdateBodyLinkInput = { endDate: null };

      mocks.findLinkById.mockResolvedValue(makeLink());

      mocks.updateLink.mockResolvedValue(1);

      const result = await linkService.updateLink(input, params);

      expect(mocks.findLinkById).toHaveBeenCalled();
      expect(mocks.updateLink).toHaveBeenCalledWith(
        params,
        input,
        expect.any(Date),
      );
      expect(result).toBeUndefined;
    });

    it("deve aceitar a atualização quando a data final for uma data válida (maior ou igual à data de início)", async () => {
      const params: UpdateParamsLinkInput = { id: "link-123" };

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5);
      const input: UpdateBodyLinkInput = { endDate };

      mocks.findLinkById.mockResolvedValue(makeLink());

      mocks.updateLink.mockResolvedValue(1);

      const result = await linkService.updateLink(input, params);

      expect(mocks.findLinkById).toHaveBeenCalled();
      expect(mocks.updateLink).toHaveBeenCalledWith(
        params,
        input,
        expect.any(Date),
      );
      expect(result).toBeUndefined;
    });

    it("deve rejeitar a atualização quando retornar count = 0", async () => {
      const params: UpdateParamsLinkInput = { id: "link-123" };
      const input: UpdateBodyLinkInput = { endDate: null };

      mocks.findLinkById.mockResolvedValue(makeLink());

      mocks.updateLink.mockResolvedValue(0);

      await expect(linkService.updateLink(input, params)).rejects.toMatchObject(
        {
          statusCode: 409,
          code: "LINK_NOT_MODIFIABLE",
        },
      );

      expect(mocks.findLinkById).toHaveBeenCalledWith(params.id);
      expect(mocks.updateLink).toHaveBeenCalledWith(
        params,
        input,
        expect.any(Date),
      );
    });
  });
});
