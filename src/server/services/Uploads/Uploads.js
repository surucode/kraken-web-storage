import fs from "fs";

import FileUpload from "../../plugins/fastify-file-upload";

import { StoredObject } from "../../../db";

export default async function routes(fastify, options) {
  fastify.register(FileUpload, {
    useTempFiles: true,
    tempFileDir: "/tmp/"
  });

  fastify.post("/upload", async (request, reply) => {
    console.log(request);
    console.log(request.files);
    console.log(request.raw);
    console.log(request.raw.files);

    const uploaded = request.raw.files["data"];
    const {
      data,
      name: filename,
      mimetype,
      size,
      md5,
      tempFilePath
    } = uploaded;

    const stream = fs.createReadStream(tempFilePath);

    await new Promise((resolve, reject) =>
      stream.on("open", resolve).on("error", reject)
    );

    const stored = await StoredObject.storeFile({
      filename,
      mimetype,
      stream,
      size,
      md5
    });

    return stored._id.toString();
  });
}
