import { uuid, shuffle, getSftp, files, servers } from "../../../Clover";
import FileUpload from "fastify-file-upload";

import CRC32Stream from "crc32-stream";
import shastream from "sha1-stream";

import File from "../../../db";

export default async function routes(fastify, options) {
  fastify.register(FileUpload);

  fastify.post("/upload", async (request, reply) => {
    // some code to handle file
    const uploaded = request.raw.files["data"];
    console.log(uploaded);
    const { data, filename, size } = uploaded;

    const [crc32, sha1] = Promise.all([
      new Promise(resolve => {
        const sniff = new CRC32Stream();
        sniff.on("end", () => resolve(sniff.digest()));
        sniff.end(data);
      }),
      new Promise(resolve => {
        const sniff = shastream.createStream("sha1");
        sniff.on("digest", result => resolve(result));
        sniff.end(data);
      })
    ]);

    const storages = shuffle(servers).slice(0, 3);
    console.log(storages);

    const file = new File({
      crc32,
      sha1,
      filename,
      content_type: "application/octet-stream",
      size
    });

    await Promise.all(
      storages.map(async storage => {
        const { sftp, client } = await getSftp(storage);

        const str = sftp.createWriteStream(`/files/${sha1}`);

        await new Promise((resolve, reject) => {
          str
            .on("finish", resolve)
            .on("error", reject)
            .on("open", () => {
              str.end(file.data);
            });
        });
        // file.storage_nodes << storage_id
        client.end();
      })
    );

    await file.save();

    return sha1;
  });
}
