// express.d.ts

import { MulterFile } from "multer"; // Make sure to import MulterFile from multer

declare module "express" {
  interface Request {
    files: {
      [fieldname: string]: MulterFile[];
    };
  }
}
