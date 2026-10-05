import {v2 as cloudinary} from "cloudinary";
import streamifier from "streamifier";


// cloudinary
//End cloudinary

let streamUpload = (buffer: any) => {
  return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream({resource_type:"auto"},
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadToCloudinary = async (buffer: any) => {
  cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_KEY, api_secret: process.env.CLOUD_SECRET });
  let result = await streamUpload(buffer);
  return result["secure_url"];
}
