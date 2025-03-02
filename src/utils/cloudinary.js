const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Subir imagen a Cloudinary
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "vegan_recipes", // Carpeta en Cloudinary
      use_filename: true,
      unique_filename: false,
    });
    return result;
  } catch (error) {
    throw new Error("Error al subir imagen a Cloudinary");
  }
};

// Eliminar imagen de Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0]; // Extrae el public_id de la URL
    await cloudinary.uploader.destroy(`vegan_recipes/${publicId}`);
  } catch (error) {
    throw new Error("Error al eliminar imagen de Cloudinary");
  }
};

module.exports = { uploadImage, deleteImage };
