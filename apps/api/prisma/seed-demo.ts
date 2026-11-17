// Seed de DEMONSTRAÇÃO — cria um admin, advogados, secretárias e alguns vínculos
// (ativo, agendado, encerrado e cancelado) para visualizar a tela de vínculos.
// Uso: npx tsx --env-file=.env prisma/seed-demo.ts
import argon2 from "argon2";
import { prisma } from "../src/lib/prisma.js";

const ADMIN_EMAIL = "deyvidyalvessilva@gmail.com";
const DEMO_PASSWORD = "Verum@2026";

async function upsertUser(
  email: string,
  name: string,
  role: "ADMIN" | "LAWYER" | "SECRETARY",
  passwordHash: string,
) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role, isActive: true, passwordSetupCompletedAt: new Date() },
    create: {
      email,
      name,
      role,
      passwordHash,
      isActive: true,
      passwordSetupCompletedAt: new Date(),
    },
  });
}

async function main() {
  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  const admin = await upsertUser(ADMIN_EMAIL, "Deyvidy Alves", "ADMIN", passwordHash);

  const [ana, paulo] = await Promise.all([
    upsertUser("ana.lima@verum.adv.br", "Dra. Ana Lima", "LAWYER", passwordHash),
    upsertUser("paulo.mendes@verum.adv.br", "Dr. Paulo Mendes", "LAWYER", passwordHash),
  ]);

  const [bruno, carla, diego] = await Promise.all([
    upsertUser("bruno.souza@verum.adv.br", "Bruno Souza", "SECRETARY", passwordHash),
    upsertUser("carla.dias@verum.adv.br", "Carla Dias", "SECRETARY", passwordHash),
    upsertUser("diego.rocha@verum.adv.br", "Diego Rocha", "SECRETARY", passwordHash),
  ]);

  // marca o setup inicial como concluído (fecha o autocadastro)
  await prisma.systemSetup.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // limpa vínculos anteriores do seed para poder rodar de novo sem duplicar
  await prisma.lawyerSecretaryLink.deleteMany({
    where: { lawyerId: { in: [ana.id, paulo.id] } },
  });

  const d = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

  await prisma.lawyerSecretaryLink.createMany({
    data: [
      // ativo
      { lawyerId: ana.id, secretaryId: bruno.id, startDate: d("2025-02-01"), endDate: null },
      // agendado (início futuro)
      { lawyerId: paulo.id, secretaryId: carla.id, startDate: d("2099-03-01"), endDate: null },
      // encerrado (término no passado)
      { lawyerId: ana.id, secretaryId: diego.id, startDate: d("2020-01-10"), endDate: d("2021-01-10") },
      // cancelado
      {
        lawyerId: paulo.id,
        secretaryId: bruno.id,
        startDate: d("2024-05-01"),
        endDate: null,
        canceledAt: new Date("2024-06-01T00:00:00.000Z"),
        cancellationReason: "Vínculo cadastrado incorretamente.",
        canceledById: admin.id,
      },
    ],
  });

  const users = await prisma.user.count();
  const links = await prisma.lawyerSecretaryLink.count();
  console.log("Seed de demonstração concluído.");
  console.log(`  usuários no banco ... ${users}`);
  console.log(`  vínculos no banco ... ${links}`);
  console.log(`\n  Login admin: ${ADMIN_EMAIL}`);
  console.log(`  Senha ......: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Falha no seed de demonstração:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
