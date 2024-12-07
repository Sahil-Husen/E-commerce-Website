import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({storage:storage}) // this will store the images in this directory
export default upload;