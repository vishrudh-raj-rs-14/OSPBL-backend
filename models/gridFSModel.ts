import mongoose from "mongoose";

const gridFSFilesSchema = new mongoose.Schema({
  filename: {
    type: String,
  },

  contentType: {
    type: String,
  },
  size: {
    type: Number,
  },
  uploadDate: {
    type: Date,
  },
  url: {
    type: String,
  },
});

const Gridfs = mongoose.model("Gridfs", gridFSFilesSchema);

export default Gridfs;
