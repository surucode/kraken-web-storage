import { Schema } from "mongoose";

import timestamps from "mongoose-updated_at";

const StoredObjectSchema = Schema(
  {
    file: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[0-9a-f]{40}$/
    },
    filename: {
      type: String,
      required: true,
      maxlength: 255
    },
    pub: {
      type: Boolean,
      required: true
    },
    metadata: {
      type: Object
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: "stored_objects" }
);

StoredObjectSchema.plugin(timestamps, {
  createdAtOn: "created_at",
  updatedAtOn: "updated_at"
});

export default StoredObjectSchema;
