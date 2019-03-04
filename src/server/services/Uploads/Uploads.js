import { uuid, shuffle, getSftp } from "../../../Clover";
import FileUpload from "fastify-file-upload";

export default async function routes(fastify, options) {
  fastify.register(FileUpload);

  fastify.post("/upload", async (request, reply) => {
    // some code to handle file
    const file = request.raw.files["data"];

    const filename = uuid();
    files[filename] = [];
    const storages = shuffle(servers).slice(0, 3);
    console.log(storages);

    await Promise.all(
      storages.map(async storage => {
        const { sftp, client } = await getSftp(storage);

        const str = sftp.createWriteStream(`/files/${filename}`);

        await new Promise((resolve, reject) => {
          str
            .on("finish", resolve)
            .on("error", reject)
            .on("open", () => {
              str.end(file.data);
            });
        });
        files[filename].push(storage);
        client.end();
      })
    );

    return filename;
  });
}
