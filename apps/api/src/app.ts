// src/app.ts
import "./config/env.js";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes.js";

const app = express();

// Origens liberadas no CORS — DEV ONLY (dev server do Electron/Vite).
// Em produção, usar a origem do app empacotado (ou configurar por env).
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174" // fallback: Vite usa quando a 5173 está ocupada
];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

app.use("/api", routes);


app.use(errorHandler);
export default app;