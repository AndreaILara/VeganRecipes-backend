const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v2: cloudinary } = require("cloudinary");
const mongoose = require("mongoose");
const Recipe = require("../api/models/Recipe");
require("dotenv").config();

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const CSV_FILE_PATH = path.join(__dirname, "../data/recipes.csv");
const OUTPUT_CSV_PATH = path.join(__dirname, "../data/recipes_fixed.csv");
const CLOUDINARY_FOLDER = "vegan_recipes";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const updatedRecipes = [];

function normalize(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, "_");
}

function findLocalImage(title) {
  const safeTitle = normalize(title);
  const possibleExtensions = [".jpg", ".jpeg"];

  for (const ext of possibleExtensions) {
    const filePath = path.join(UPLOADS_DIR, `${safeTitle}${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

async function uploadToCloudinary(filePath, title) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: CLOUDINARY_FOLDER,
      public_id: normalize(title),
    });
    console.log(`☁️ Subida a Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error subiendo imagen para ${title}:`, error);
    return null;
  }
}

async function processCSV() {
  return new Promise((resolve, reject) => {
    const promises = [];

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on("data", (row) => {
        promises.push(
          (async () => {
            if (!row.title) {
              console.log("⚠️ Fila sin título, se omitirá.");
              return;
            }


            const localImagePath = findLocalImage(row.title);
            if (!localImagePath) {
              console.log(`❌ No se encontró imagen para ${row.title}, eliminando URL anterior.`);
              row.image = "";
              updatedRecipes.push(row);
              return;
            }


            const cloudinaryUrl = await uploadToCloudinary(localImagePath, row.title);
            if (cloudinaryUrl) {
              row.image = cloudinaryUrl;
            }

            updatedRecipes.push(row);


            await Recipe.findOneAndUpdate({ title: row.title }, { image: row.image });
          })()
        );
      })
      .on("end", async () => {
        await Promise.all(promises);
        resolve();
      })
      .on("error", (error) => reject(error));
  });
}

async function main() {
  try {
    console.log("🚀 Iniciando la actualización de imágenes...");
    await processCSV();

    const csvContent = [
      "title,description,ingredients,steps,category,image",
      ...updatedRecipes.map((r) =>
        `${r.title},${r.description},"${r.ingredients}","${r.steps}",${r.category},${r.image}`
      ),
    ].join("\n");

    fs.writeFileSync(OUTPUT_CSV_PATH, csvContent, "utf8");
    console.log("✅ CSV actualizado con nuevas imágenes de Cloudinary.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    mongoose.connection.close();
  }
}

main();
