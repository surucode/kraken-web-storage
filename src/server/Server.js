import fastify from "fastify";
import { Uploads, Downloads } from "./services";

const server = fastify({
  logger: true
});

server.register(Uploads);
server.register(Downloads);

export default server;
