import { Schema } from "mongoose";
import { ObjectId } from "mongoose/types";

export default Schema({
  _id: {
    type: ObjectId,
    required: true,
    index: true
  },
  file: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[0-9a-f]{40}$/
  },
  public: {
    type: Boolean,
    required: true
  },
  metadata: {
    type: Object
  }
});
