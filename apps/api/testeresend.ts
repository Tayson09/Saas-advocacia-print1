import { sendPasswordSetupEmail } from "./src/lib/email.service.js";

await sendPasswordSetupEmail({
  to: "willahelmoliveira@gmail.com",
  name: "Teste",
  token: "token-de-teste",
});