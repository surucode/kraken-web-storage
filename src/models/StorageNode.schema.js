import { Schema } from "mongoose";

export default Schema({
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
    type: "text",
    required: true,
    match: /^-----BEGIN RSA PRIVATE KEY-----.*-----END RSA PRIVATE KEY-----$/
  }
});
