import mongoose from "mongoose";
import StoredObjectSchema from "./StoredObject.schema.js";

import StorageNode from "./StorageNode";
import File from "./File";

const StoredObject = mongoose.model("StoredObject", StoredObjectSchema);

StoredObject.storeFile = async ({
  filename,
  size,
  stream,
  mimetype,
  md5,
  pub,
  metadata
}) => {
  let file = await File.findOne({ md5 }).exec();

  if (!file) {
    file = await File.create({ md5, mimetype, size });
    const nodes = await StorageNode.findRandom()
      .limit(3)
      .exec();
    await Promise.all(nodes.map(node => node.writeFile(file, stream)));
  }

  const stored = await StoredObject.create({
    md5,
    filename,
    pub: pub || true,
    metadata: metadata || {}
  });

  stored.FileModel = file;

  return stored;
};

StoredObject.prototype.getReadStream = async function() {
  if (!this.file) throw new Error("No file found for this object");

  const storage = this.file.storage_nodes[
    Math.floor(Math.random() * this.file.storage_nodes.length)
  ];

  if (!storage) throw new Error("No storage found for this file");

  return await storage.readFile(this.file);
};

export default StoredObject;
