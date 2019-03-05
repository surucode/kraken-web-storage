import FileSchema from "./StorageNode.schema.js";

const File = mongoose.model("StorageNode", FileSchema);

export default File;
