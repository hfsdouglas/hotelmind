import { fastifyCors } from "@fastify/cors";
import { FastifyTypedInstance } from "@/types/fastify";

export function setCors(app: FastifyTypedInstance) {
  app.register(fastifyCors, {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
}
