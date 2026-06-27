import { fastifyCors } from "@fastify/cors";
import { FastifyTypedInstance } from "@/types/fastify";

export function setCors(app: FastifyTypedInstance) {
  app.register(fastifyCors, {
    origin: [
      "http://localhost:5173",
      "https://app.roomio.com.br",
      "https://pmsroomio.netlify.app",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
}
