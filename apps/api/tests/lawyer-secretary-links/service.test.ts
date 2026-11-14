import { linkService } from "../../src/modules/lawyer-secretary-links/lawyer-secretary-links.service.js";
import type { LinkInput } from "../../src/modules/lawyer-secretary-links/lawyer-secretary-links.schema.js";
import { UserRole } from "../../src/generated/prisma/enums.js";
import type { LawyerSecretaryLink } from "../../src/generated/prisma/client.js";

const mocks = vi.hoisted(() => ({
  findForAuthorization: vi.fn(),
  createLink: vi.fn(),
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
    },
  }),
);

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
          role: UserRole.LAWYER || UserRole.ADMIN,
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
});
