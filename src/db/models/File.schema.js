import { Schema } from "mongoose";
import { ObjectId } from "mongoose/types";

const schema = Schema({
  crc32: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
    match: /^[0-9A-F]{8}$/
  },
  sha1: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true,
    match: /^[0-9a-f]{40}$/
  },
  filename: {
    type: String,
    required: true,
    maxlength: 255
  },
  content_type: {
    type: String,
    required: true,
    maxlength: 255
  },
  size: {
    type: Number,
    required: true
  },
  storage_nodes: [{ type: ObjectId, ref: "StorageNode", index: true }]
});

schema.index({ sha1: 1, storage_nodes: 1 });
schema.index({ crc32: 1, sha1: 1 });

export default schema;
