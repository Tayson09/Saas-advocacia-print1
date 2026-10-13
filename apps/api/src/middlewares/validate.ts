import { Request, Response, NextFunction } from "express";
import { z, ZodType} from "zod";
import { ValidationError, ValidationIssue } from "../helpers/erros/validation-error.js";

interface RequestSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

const locations = ["body", "params", "query"] as const;

export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const issues: ValidationIssue[] = [];

    for (const location of locations) {
      const schema = schemas[location];

      if (!schema) continue;

      const result = schema.safeParse(req[location]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({
            location,
            path: issue.path.join("."),
            message: issue.message,
          });
        }
        continue;
      }
    
      if (location === "query") {
        // no Express 5, req.query é somente leitura (getter)
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
        });
      } else {
        req[location] = result.data as any;
      }
    }
    if (issues.length > 0) {
        return next(new ValidationError(issues));
      }

      next();
  }
}