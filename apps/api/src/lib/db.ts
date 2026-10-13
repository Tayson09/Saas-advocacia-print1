// src/lib/db.ts
import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";

export type DbClient = PrismaClient | Prisma.TransactionClient;
export const defaultDb: DbClient = prisma;