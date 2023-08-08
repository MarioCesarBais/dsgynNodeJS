// const fs = require('fs');

// const deleteFile = (filePath) => {
//     fs.unlink(filePath, (err) => {
//         if (err) {
//             throw (err);
//         }
//     });
// }

// exports.deleteFile = deleteFile;

const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: 'your_cloud_name',
//   api_key: 'your_api_key',
//   api_secret: 'your_api_secret'
// });

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
