import { clientSchema } from "./schema.js";
// Teste 1: PF válida
const individualResult = clientSchema.create.body.safeParse({
  type: "INDIVIDUAL",
  name: "João da Silva",
  document: "529.982.247-25",
  email: "joao@email.com",
  phone: "88999999999",

  individualData: {
    birthDate: "1995-05-20",
    rg: "123456789",
    profession: "Advogado",
  },

  addresses: [
    {
      type: "RESIDENTIAL",
      zipCode: "63000000",
      street: "Rua das Flores",
      number: "123",
      city: "Juazeiro do Norte",
      state: "CE",
      isPrimary: true,
    },
  ],
});

console.log("PF válida:", individualResult);

// Teste 2: PJ válida
const companyResult = clientSchema.create.body.safeParse({
  type: "COMPANY",
  name: "Empresa Exemplo LTDA",
  document: "11222333000181",
  email: "contato@empresa.com",

  companyData: {
    tradeName: "Empresa Exemplo",
    legalNature: "Sociedade Empresária Limitada",
  },
});

console.log("PJ válida:", companyResult);

// Teste 3: CPF inválido
const invalidCPF = clientSchema.create.body.safeParse({
  type: "INDIVIDUAL",
  name: "João da Silva",
  document: "11111111111",
});

console.log("CPF inválido:", invalidCPF);

// Teste 4: Tipo incompatível
const incompatibleData = clientSchema.create.body.safeParse({
  type: "INDIVIDUAL",
  name: "João da Silva",
  document: "52998224725",

  companyData: {
    tradeName: "Empresa Exemplo",
  },
});

console.log("Dados incompatíveis:", incompatibleData);

// Teste 5: Nome ausente
const missingName = clientSchema.create.body.safeParse({
  type: "INDIVIDUAL",
  document: "52998224725",
});

console.log("Nome ausente:", missingName);