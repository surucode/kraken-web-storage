import FileSchema from "./File.schema.js";

const File = mongoose.model("File", FileSchema);

export default File;
