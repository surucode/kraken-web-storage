import fs from "fs";

import FileUpload from "../../plugins/fastify-file-upload";

import { StoredObject } from "../../../db";

export default async function routes(fastify, options) {
  fastify.register(FileUpload, {
    useTempFiles: true,
    tempFileDir: "/tmp/"
  });

  fastify.post("/upload", async (request, reply) => {
    const uploaded = request.raw.files["data"];
    const {
      data,
      name: filename,
      mimetype,
      size,
      md5,
      tempFilePath: path
    } = uploaded;

    const stored = await StoredObject.storeFile({
      filename,
      path,
      mimetype,
      size,
      md5
    });

    return stored._id.toString();
  });
}
