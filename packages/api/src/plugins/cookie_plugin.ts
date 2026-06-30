import { fastifyCookie } from "@fastify/cookie";
import { FastifyTypedInstance } from "@/types/fastify";

import { COOKIE_SECRET } from "@/config/env";

export function setCookie(app: FastifyTypedInstance) {
  app.register(fastifyCookie, {
    secret: COOKIE_SECRET,
  });
}
