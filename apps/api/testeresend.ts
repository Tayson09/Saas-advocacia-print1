import { sendPasswordSetupEmail } from "./src/lib/email.service.js";

await sendPasswordSetupEmail({
  to: "deyvidy.alves07@aluno.ifce.edu.br",
  name: "Teste",
  token: "token-de-teste",
});