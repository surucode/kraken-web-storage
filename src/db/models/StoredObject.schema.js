import { Schema } from "mongoose";

import timestamps from "mongoose-updated_at";

const StoredObjectSchema = Schema(
  {
    md5: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      match: /^[0-9a-f]{32}$/
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

StoredObjectSchema.virtual("file", {
  ref: "File", // The model to use
  localField: "md5", // Find people where `localField`
  foreignField: "md5", // is equal to `foreignField`
  justOne: true
});

StoredObjectSchema.plugin(timestamps, {
  createdAtOn: "created_at",
  updatedAtOn: "updated_at"
});

export default StoredObjectSchema;
