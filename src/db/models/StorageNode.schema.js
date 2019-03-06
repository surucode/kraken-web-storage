import { Schema } from "mongoose";

import random from "mongoose-random";
import timestamps from "mongoose-updated_at";

const StorageNodeSchema = Schema(
  {
    host: {
      type: String,
      index: true,
      unique: true,
      required: true
    },
    port: {
      type: Number,
      required: true,
      default: 22
    },
    user: {
      type: String,
      required: true
    },
    private_key: {
      type: String,
      required: true,
      match: /^-----BEGIN (RSA|OPENSSH) PRIVATE KEY-----(.|[\r\n])*-----END (RSA|OPENSSH) PRIVATE KEY-----$/
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: "storage_nodes" }
);

StorageNodeSchema.plugin(timestamps, {
  createdAtOn: "created_at",
  updatedAtOn: "updated_at"
});

StorageNodeSchema.plugin(random, { path: "_r" });

export default StorageNodeSchema;
