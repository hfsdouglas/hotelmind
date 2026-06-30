import z from "zod";
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const PayloadJWTSchema = z.object({
  sub: z.string(),
  user: z.object({
    hotelId: z.uuid(),
    nomecompleto: z.string(),
    email: z.email(),
  }),
});

export type PayloadJWTType = z.infer<typeof PayloadJWTSchema>;

async function authPlugin(app: FastifyInstance) {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { token } = request.cookies;

      if (!token) {
        return reply.status(401).send({
          message: "Token não fornecido!",
        });
      }

      try {
        const decoded = await request.jwtVerify<PayloadJWTType>();

        request.user = {
          userId: decoded.sub,
          hotelId: decoded.user.hotelId,
          nomecompleto: decoded.user.nomecompleto,
          email: decoded.user.email,
        };
      } catch (error) {
        return reply.status(401).send({
          message: "Token inválido!",
        });
      }
    },
  );
}

export default fp(authPlugin);
