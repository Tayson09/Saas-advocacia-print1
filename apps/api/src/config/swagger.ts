import swaggerJSDoc from "swagger-jsdoc";
import { clientOpenApiSchemas } from "../modules/clients/docs/client.openapi.js";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "VERUM API",
      version: "1.0.0",
      description: "Documentação da API do sistema VERUM",
    },

    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de desenvolvimento",
      },
    ],

    components: {
      schemas: {
        ...clientOpenApiSchemas,
      },
    },
  },

  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
