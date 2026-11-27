import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { ClientController } from "./controller.js";
import { clientSchema } from "./schema.js";

const router = Router();

/**
 * @openapi
 * /clients:
 *   post:
 *     summary: Cadastra um cliente
 *     description: Cadastra uma pessoa física ou jurídica no escritório do usuário autenticado.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateIndividualClient'
 *               - $ref: '#/components/schemas/CreateCompanyClient'
 *             discriminator:
 *               propertyName: type
 *               mapping:
 *                 INDIVIDUAL: '#/components/schemas/CreateIndividualClient'
 *                 COMPANY: '#/components/schemas/CreateCompanyClient'
 *
 *     responses:
 *       201:
 *         description: Cliente cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 *
 *       400:
 *         description: Dados enviados inválidos.
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       409:
 *         description: Já existe um cliente com esse CPF/CNPJ neste escritório.
 */
router.post(
  "/",
  authenticate,
  validate({ body: clientSchema.create.body }),
  ClientController.create,
);


export default router;
