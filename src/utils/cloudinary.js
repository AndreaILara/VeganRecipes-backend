const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary Configurado:", cloudinary.config());

const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "vegan_recipes", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("❌ Error al subir imagen a Cloudinary:", error);
          return reject(new Error("Error al subir imagen a Cloudinary"));
        }
        resolve(result);
      }
    );

    stream.end(buffer); // 🔹 Enviar la imagen en `buffer` al stream
  });
};

const deleteImage = async (imageUrl) => {
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0]; // Extrae el `public_id` de la URL
    await cloudinary.uploader.destroy(`vegan_recipes/${publicId}`);
  } catch (error) {
    console.error("❌ Error al eliminar imagen de Cloudinary:", error);
    throw new Error("Error al eliminar imagen de Cloudinary");
  }
};

module.exports = { uploadImage, deleteImage };
