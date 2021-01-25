//For image storing purposes this page uses Cloudinary services
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

//Configurating cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

//Put all files into specific folder and allow only certain formats
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
})

module.exports = {
  cloudinary,
  storage
}