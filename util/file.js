const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.YOUR_CLOUD_NAME,
    api_key: process.env.YOUR_API_KEY,
    api_secret: process.env.YOUR_API_SECRET
  });

const deleteFile = (publicId) => {
  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      throw error;
    }
    console.log(result);
  });
};

exports.deleteFile = deleteFile;
