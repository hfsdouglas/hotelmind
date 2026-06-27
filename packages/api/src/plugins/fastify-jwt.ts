import { fastifyJwt } from "@fastify/jwt";
import { FastifyTypedInstance } from "@/types/fastify";

import { JWT_SECRET } from "@/config/env";

import authPlugin from "@/plugins/auth-plugin";

export function setJWT(app: FastifyTypedInstance) {
  app.register(fastifyJwt, {
    secret: JWT_SECRET,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  app.register(authPlugin);
}
