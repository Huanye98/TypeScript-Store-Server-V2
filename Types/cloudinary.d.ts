declare module "multer-storage-cloudinary" {
  import * as Cloudinary from "cloudinary";
  import { StorageEngine } from "multer";
  import { Request } from "express";

  interface TransformationOptions {
    quality?: string;
    fetch_format?: string;
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
  }

  interface Params {
    folder: string;
    allowed_formats: string[];
    transformation?: TransformationOptions[];
    public_id?: (req: Request, file: Express.Multer.File) => string;
    format?: string;
  }

  interface Options {
    cloudinary: typeof Cloudinary.v2;
    params?: Params;
  }

  class CloudinaryStorage implements StorageEngine {
    constructor(options: Options);
    _handleFile(
      req: Request,
      file: Express.Multer.File,
      callback: (error?: Error, info?: Partial<Express.Multer.File>) => void
    ): void;
    _removeFile(
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;
  }

  export = CloudinaryStorage;
}