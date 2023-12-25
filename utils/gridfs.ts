// gridfs.ts

import mongoose from "mongoose";
import { GridFSBucketReadStream, GridFSBucketWriteStream } from "mongodb";
import stream from "stream";

const saveToGridFS = async (file: any): Promise<string> => {
  const { buffer, mimetype, originalname } = file;

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads", // Change this to your desired GridFS bucket name
  });

  const uploadStream = bucket.openUploadStream(originalname, {
    metadata: {
      mimeType: mimetype,
    },
  });

  const readableStream = new stream.PassThrough();
  readableStream.end(buffer);

  await new Promise((resolve, reject) => {
    readableStream.pipe(uploadStream).on("finish", resolve).on("error", reject);
  });

  return uploadStream.id.toString();
};

export { saveToGridFS };
