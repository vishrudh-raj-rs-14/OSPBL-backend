import multer from "multer";

const storage = multer.memoryStorage(); // You can customize the storage as per your requirements

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit, you can adjust this
});

export default upload;
