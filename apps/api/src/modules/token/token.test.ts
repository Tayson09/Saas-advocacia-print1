// src/tests/auth.test.ts
import * as t from '../token/token.service.js'; // Ajuste o caminho conforme sua pasta
import { AccessTokenExpired } from '../../helpers/errors/access-token-expired.errors.js';
import { AccessTokenInvalid } from '../../helpers/errors/access-token-invalid.errors.js';

function runTests() {
  console.log("🚀 Iniciando testes de autenticação...\n");

  // Mock de dados do usuário respeitando estritamente a interface userPayloadData
  const mockUser: t.userPayloadData = {
    id: 'user-123',
    name: 'Guilherme Advogado',
    role: 'LAWYER'
  };

  // ==============================================================================
  // 1. TESTE DO ACCESS TOKEN (Cenário de Sucesso)
  // ==============================================================================
  // Passando o objeto de usuário completo conforme exigido
  const access = t.generateAccessToken(mockUser);
  
  // A verificação deve extrair o 'sub' (id do usuário) com sucesso
  const result = t.verifyAccessToken(access);
  console.log("✅ Token de acesso verificado com sucesso!"); 
  console.log("-> Retorno esperado:", result); // Deve exibir: { userId: 'user-123' }


  // ==============================================================================
  // 2. TESTE DE TOKEN CORROMPIDO (Cenário de Erro)
  // ==============================================================================
  try { 
    // Alterando a assinatura do token de propósito adicionando um 'x' no final
    t.verifyAccessToken(access + 'x'); 
    console.error("❌ Falha: O sistema aceitou um token corrompido!");
  } catch (e: any) { 
    // Capturando as suas classes de erro reais importadas dos seus arquivos de erro
    if (e instanceof AccessTokenInvalid) {
      console.log(`✅ Teste de erro passou! Exceção correta capturada: ${e.constructor.name}`);
      console.log(`-> Mensagem tratada: "${e.message}" | Código HTTP: ${e.statusCode}`);
    } else {
      console.error("❌ Erro inesperado capturado. Deveria ser AccessTokenInvalid, mas veio:", e);
    }
  }


  // ==============================================================================
  // 3. TESTE DO REFRESH TOKEN E PERSISTÊNCIA SECO (OWASP)
  // ==============================================================================
  // Gera o token aleatório opaco (string base64url estável e sem JWT)
  const refresh = t.generateRefreshToken();
  
  // Aplica o hash SHA-256 que será guardado na tabela do Postgres
  const hashedToken = t.hashRefreshToken(refresh);

  console.log("\n🔒 Dados do Refresh Token gerados com sucesso:");
  console.log(`-> Token Opaco (Enviado de forma segura ao Electron): ${refresh}`);
  console.log(`-> Hash SHA-256 (Salvo de forma segura no banco via Prisma): ${hashedToken}`);
}

try {
  runTests();
} catch (error) {
  console.error("❌ Ocorreu um erro crítico durante a execução dos testes:", error);
}