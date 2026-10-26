// src/app.ts
import "./config/env.js";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes.js";

const app = express();

// CORS para o app desktop (Electron): em dev o renderer roda em alguma
// porta do Vite (localhost:5173+, podendo variar) e em build empacotado
// carrega via file://, enviando Origin "null". Liberamos qualquer origem
// local e requisições sem origem (apps nativos/curl) — a API é local.
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocal =
        !origin ||
        origin === "null" ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(null, isLocal);
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", routes);


app.use(errorHandler);
export default app;