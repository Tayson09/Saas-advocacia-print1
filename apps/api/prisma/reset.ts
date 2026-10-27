// Limpa todos os perfis (admin, advogados, secretários) e volta o sistema
// ao estado de instalação inicial — o app pedirá o setup do primeiro admin de novo.
//
// Uso: npm run db:reset
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const userCount = await prisma.user.count();

  // A ordem respeita as FKs. RefreshToken e PasswordSetupToken têm cascade no
  // delete do usuário, mas AuditLog é SetNull — então limpamos explicitamente.
  const [auditLogs, refreshTokens, setupTokens, users, systemSetup] =
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.passwordSetupToken.deleteMany(),
      prisma.user.deleteMany(),
      prisma.systemSetup.deleteMany(),
    ]);

  console.log("Banco limpo. Estado de instalação inicial restaurado.");
  console.log(`  usuários removidos .......... ${users.count} (contagem anterior: ${userCount})`);
  console.log(`  refresh tokens removidos .... ${refreshTokens.count}`);
  console.log(`  tokens de senha removidos ... ${setupTokens.count}`);
  console.log(`  logs de auditoria removidos . ${auditLogs.count}`);
  console.log(`  registro de setup removido .. ${systemSetup.count}`);
}

main()
  .catch((err) => {
    console.error("Falha ao limpar o banco:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
