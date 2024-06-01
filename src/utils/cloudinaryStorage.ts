import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary'
import path from 'path'

export default function uploadMiddleware(folderName: string) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      const folderPath = `${folderName.trim()}`
      const fileExtension = path.extname(file.originalname).substring(1)
      const publicId = `${file.fieldname}-${Date.now()}`

      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension
      }
    }
  })

  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // keep images size < 5 MB
    }
  })
}
