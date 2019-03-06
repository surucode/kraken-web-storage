import { Schema } from "mongoose";
import timestamps from "mongoose-updated_at";

const { ObjectId } = Schema.Types;

const FileSchema = Schema(
  {
    md5: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      match: /^[a-f0-9]{32}$/
    },
    sha1: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true,
      match: /^[0-9a-f]{40}$/
    },
    mimetype: {
      type: String,
      required: true,
      maxlength: 255
    },
    size: {
      type: Number,
      required: true
    },
    storage_nodes: [{ type: ObjectId, ref: "StorageNode", index: true }]
  },
  { collection: "files" }
);

FileSchema.index({ storage_nodes: 1 });
FileSchema.index({ md5: 1, sha1: 1 });

FileSchema.plugin(timestamps, {
  createdAtOn: "created_at",
  updatedAtOn: "updated_at"
});

export default FileSchema;
