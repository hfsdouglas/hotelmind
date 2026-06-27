import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

import { FastifyTypedInstance } from "@/types/fastify";

export function setSwagger(app: FastifyTypedInstance) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Hotel",
        description:
          "Hotel — seu HMS para gerenciar hóspedes, reservas e experiências inesquecíveis.",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });
}
