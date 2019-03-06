import FileUpload from "fastify-file-upload";

import { StoredObject } from "../../../db";

export default async function routes(fastify, options) {
  fastify.register(FileUpload);

  fastify.post("/upload", async (request, reply) => {
    // some code to handle file
    const uploaded = request.raw.files["data"];
    const { data, name: filename, mimetype } = uploaded;

    const stored = await StoredObject.storeFile({
      filename,
      mimetype,
      data
    });

    return stored._id.toString();
  });
}
