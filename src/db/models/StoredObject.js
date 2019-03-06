import mongoose from "mongoose";
import StoredObjectSchema from "./StoredObject.schema.js";

import shastream from "sha1-stream";

import StorageNode from "./StorageNode";
import File from "./File";

const StoredObject = mongoose.model("StoredObject", StoredObjectSchema);

StoredObject.storeFile = async ({
  filename,
  data,
  mimetype,
  pub,
  metadata
}) => {
  const size = data.byteLength;

  const [md5, sha1] = await Promise.all([
    new Promise((resolve, reject) => {
      const sniff = shastream.createStream("md5");
      sniff.on("digest", result => resolve(result));
      sniff.on("error", err => reject(err));
      sniff.end(data);
    }),
    new Promise((resolve, reject) => {
      const sniff = shastream.createStream("sha1");
      sniff.on("digest", result => resolve(result));
      sniff.on("error", err => reject(err));
      sniff.end(data);
    })
  ]);

  let file = await File.findOne({ md5, sha1 }).exec();

  if (!file) {
    file = await File.create({ md5, sha1, mimetype, size });
    const nodes = await StorageNode.findRandom()
      .limit(3)
      .exec();
    await Promise.all(nodes.map(node => node.scpFile(file, data)));
  }

  const stored = await StoredObject.create({
    file: sha1,
    filename,
    pub: pub || true,
    metadata: metadata || {}
  });

  stored.FileModel = file;

  return stored;
};

export default StoredObject;
