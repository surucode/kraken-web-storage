import { getSftp, files, shuffle } from "../../../Clover";

export default async function routes(fastify, options) {
  fastify.get("/files/:file_id", async (request, reply) => {
    const filename = request.params.file_id;
    const file_storages = files[filename];
    if (file_storages) {
      const storage = shuffle(file_storages)[0];
      const { sftp, client } = await getSftp(storage);

      await new Promise((resolve, reject) => {
        sftp.stat("/files/" + filename, (err, stats) => {
          if (err) return reject(err);

          console.log(stats);

          const str = sftp.createReadStream(`/files/${filename}`);

          if (str) {
            str
              .on("finish", resolve)
              .on("error", reject)
              .on("open", () => {
                reply.send(str);
              });
          }
        });
      });
    }
  });
}
