import "dotenv/config";

import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import { PORT } from "@/config/env";
import { HOST } from "@/config/env";

import { setRoutes } from "@/plugins/fastify-routes";
import { setSwagger } from "@/plugins/fastify-swagger";
import { setCors } from "@/plugins/fastify-cors";
import { setCookie } from "@/plugins/fastify-cookie";
import { setJWT } from "@/plugins/fastify-jwt";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

setCors(app);
setSwagger(app);
setCookie(app);
setJWT(app);
setRoutes(app);

const host = HOST || "0.0.0.0";

app.listen({ port: Number(PORT), host }).then(() => {
  console.log(`Hotel server is running on host ${host} and port ${PORT}! 🏨`);
});
