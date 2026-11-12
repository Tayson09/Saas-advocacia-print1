import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { linkSchema } from "./lawyer-secretary-links.schema.js";
import { linkController } from "./lawyer-secretary-links.controller.js";

const router = Router();

/**
 * @openapi
 * /links:
 *   post:
 *     summary: Criar vínculo entre advogado e secretária
 *     description: Cria um vínculo entre um advogado e uma secretária. Acesso restrito a administradores.
 *     tags:
 *       - Vínculos advogado-secretária
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lawyerId
 *               - secretaryId
 *               - startDate
 *             properties:
 *               lawyerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do advogado.
 *               secretaryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da secretária.
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-09"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: null
 *           example:
 *             lawyerId: "b838ea95-e403-44a6-848f-c17d452928af"
 *             secretaryId: "39fe49ff-0c95-422c-a952-371a5c43111c"
 *             startDate: "2026-11-09"
 *             endDate: null
 *     responses:
 *       201:
 *         description: Vínculo criado com sucesso.
 *       400:
 *         description: Dados da requisição inválidos.
 *       401:
 *         description: Usuário não autenticado.
 *       403:
 *         description: Usuário sem permissão.
 *       404:
 *         description: Advogado ou secretária não encontrados.
 *       409:
 *         description: Já existe um vínculo com esses dados.
 *       422:
 *         description: Dados válidos, mas que violam regras de negócio.
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate({ body: linkSchema.create.body }),
  linkController.create,
);

/**
 * @openapi
 * /links/all:
 *   get:
 *     summary: Lista os vínculos entre advogados e secretárias
 *     tags:
 *       - Vínculos advogado-secretária
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vínculos retornada com sucesso.
 *       401:
 *         description: Usuário não autenticado.
 *       403:
 *         description: Usuário sem permissão.
 */
router.get("/all", authenticate, linkController.list);

/**
 * @openapi
 * /links/{id}/end:
 *   patch:
 *     summary: Encerrar vínculo entre advogado e secretária
 *     description: Encerra um vínculo ativo definindo a data de término para a data atual. Acesso restrito a administradores.
 *     tags:
 *       - Vínculos advogado-secretária
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do vínculo a ser encerrado.
 *         example: "b838ea95-e403-44a6-848f-c17d452928af"
 *     responses:
 *       204:
 *         description: Vínculo encerrado com sucesso.
 *       400:
 *         description: ID do vínculo inválido.
 *       401:
 *         description: Usuário não autenticado.
 *       403:
 *         description: Usuário sem permissão.
 *       404:
 *         description: Vínculo não encontrado.
 *       409:
 *         description: O vínculo já foi encerrado anteriormente.
 */
router.patch(
  "/:id/end",
  authenticate,
  requireAdmin,
  validate({ params: linkSchema.end.params }),
  linkController.endLink,
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate({ params: linkSchema.update.params, body: linkSchema.update.body }),
  linkController.updateLink,
);

export default router;
