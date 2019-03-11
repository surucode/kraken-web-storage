import fs from "fs";
import { promisify } from "util";

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
      name: filename,
      mimetype,
      size,
      md5,
      tempFilePath: path
    } = uploaded;

    const metadata_json =
      (request.raw.files["metadata"] &&
        (await promisify(fs.readFile)(
          request.raw.files["metadata"].tempFilePath
        ))) ||
      "";

    if (metadata_json.length > 4096) {
      throw new Error("Metadata size should be under 4KB.");
    }

    const metadata = metadata_json ? JSON.parse(metadata_json) : {};

    console.log(metadata);

    const stored = await StoredObject.storeFile({
      filename,
      path,
      mimetype,
      size,
      md5,
      metadata
    });

    return stored._id.toString();
  });
}
