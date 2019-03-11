import { StoredObject } from "../../../db";

export default async function routes(fastify, options) {
  fastify.get("/objects/:object_id", async (request, reply) => {
    const _id = request.params.object_id;

    const obj = await StoredObject.findOne({ _id }).populate({
      path: "file",
      populate: {
        path: "storage_nodes",
        model: "StorageNode"
      }
    });

    if (!obj) throw new Error("No object found for this id");

    const read_stream = await obj.getReadStream();

    reply.header("Content-Type", `${obj.file.mimetype}`);
    reply.header("Content-Disposition", `attachment; filename=${obj.filename}`);
    reply.header("X-Metadata", JSON.stringify(obj.metadata || {}));

    await new Promise((resolve, reject) => {
      if (read_stream) {
        read_stream
          .on("finish", resolve)
          .on("error", reject)
          .on("open", () => {
            reply.send(read_stream);
          });
      }
    });
  });
}
