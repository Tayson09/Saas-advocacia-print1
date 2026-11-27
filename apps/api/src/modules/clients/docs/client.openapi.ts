export const clientOpenApiSchemas = {
  CreateIndividualClient: {
    type: "object",
    required: ["type", "name", "document"],
    properties: {
      type: {
        type: "string",
        enum: ["INDIVIDUAL"],
      },
      name: {
        type: "string",
        example: "João da Silva",
      },
      document: {
        type: "string",
        example: "12345678909",
      },
      email: {
        type: "string",
        format: "email",
        example: "joao@email.com",
      },
      phone: {
        type: "string",
        example: "88999999999",
      },
      individualData: {
        $ref: "#/components/schemas/IndividualClientData",
      },
      addresses: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ClientAddressInput",
        },
      },
    },
  },

  IndividualClientData: {
    type: "object",
    properties: {
      birthDate: {
        type: "string",
        format: "date",
        example: "1995-08-20",
      },
      rg: {
        type: "string",
        example: "123456789",
      },
      maritalStatus: {
        type: "string",
        example: "Solteiro",
      },
      profession: {
        type: "string",
        example: "Advogado",
      },
      nationality: {
        type: "string",
        example: "Brasileira",
      },
    },
  },

  CreateCompanyClient: {
    type: "object",
    required: ["type", "name", "document"],
    properties: {
      type: {
        type: "string",
        enum: ["COMPANY"],
      },
      name: {
        type: "string",
        example: "Empresa Exemplo LTDA",
      },
      document: {
        type: "string",
        example: "12345678000199",
      },
      email: {
        type: "string",
        format: "email",
        example: "contato@empresa.com",
      },
      phone: {
        type: "string",
        example: "88999999999",
      },
      companyData: {
        $ref: "#/components/schemas/CompanyClientData",
      },
      addresses: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ClientAddressInput",
        },
      },
    },
  },

  CompanyClientData: {
    type: "object",
    properties: {
      tradeName: {
        type: "string",
        example: "Empresa Exemplo",
      },
      stateRegistration: {
        type: "string",
        example: "123456789",
      },
      municipalRegistration: {
        type: "string",
        example: "987654321",
      },
      openingDate: {
        type: "string",
        format: "date",
        example: "2010-05-15",
      },
      legalNature: {
        type: "string",
        example: "Sociedade Empresária Limitada",
      },
    },
  },

  ClientAddressInput: {
    type: "object",
    required: ["type", "zipCode", "street", "city", "state"],
    properties: {
      type: {
        type: "string",
        enum: ["RESIDENTIAL", "COMMERCIAL", "OTHER"],
        example: "COMMERCIAL",
      },
      zipCode: {
        type: "string",
        example: "63000000",
      },
      street: {
        type: "string",
        example: "Rua das Flores",
      },
      number: {
        type: "string",
        example: "123",
      },
      complement: {
        type: "string",
        example: "Sala 02",
      },
      neighborhood: {
        type: "string",
        example: "Centro",
      },
      city: {
        type: "string",
        example: "Juazeiro do Norte",
      },
      state: {
        type: "string",
        example: "CE",
      },
      isPrimary: {
        type: "boolean",
        example: true,
      },
    },
  },
  ClientResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      officeId: {
        type: "string",
        format: "uuid",
      },
      type: {
        type: "string",
        enum: ["INDIVIDUAL", "COMPANY"],
      },
      name: {
        type: "string",
        example: "João da Silva",
      },
      document: {
        type: "string",
        example: "12345678909",
      },
      email: {
        type: "string",
        nullable: true,
      },
      phone: {
        type: "string",
        nullable: true,
      },
      individualData: {
        allOf: [
          {
            $ref: "#/components/schemas/IndividualClientData",
          },
        ],
        nullable: true,
      },
      companyData: {
        allOf: [
          {
            $ref: "#/components/schemas/CompanyClientData",
          },
        ],
        nullable: true,
      },
      addresses: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ClientAddressResponse",
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },
  ClientAddressResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      clientId: {
        type: "string",
        format: "uuid",
      },
      type: {
        type: "string",
        enum: ["RESIDENTIAL", "COMMERCIAL", "OTHER"],
      },
      zipCode: {
        type: "string",
        example: "63000000",
      },
      street: {
        type: "string",
        example: "Rua das Flores",
      },
      number: {
        type: "string",
        nullable: true,
      },
      complement: {
        type: "string",
        nullable: true,
      },
      neighborhood: {
        type: "string",
        nullable: true,
      },
      city: {
        type: "string",
      },
      state: {
        type: "string",
        example: "CE",
      },
      isPrimary: {
        type: "boolean",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },
};
