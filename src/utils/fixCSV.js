const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../data/recipes.csv");
const outputPath = path.join(__dirname, "../data/recipes_fixed.csv");

fs.readFile(inputPath, "utf8", (err, data) => {
  if (err) {
    console.error("❌ Error al leer el archivo:", err);
    return;
  }


  let fixedCSV = data.replace(/"{/g, "{").replace(/}"/g, "}").replace(/""/g, '"');

  fs.writeFile(outputPath, fixedCSV, "utf8", (err) => {
    if (err) {
      console.error("❌ Error al guardar el archivo corregido:", err);
      return;
    }
    console.log("✅ Archivo CSV corregido guardado en:", outputPath);
  });
});
