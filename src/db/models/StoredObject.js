import StoredObjectSchema from "./StoredObject.schema.js";

const StoredObject = mongoose.model("StoredObject", StoredObjectSchema);

export default StoredObject;
