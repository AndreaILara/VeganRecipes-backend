const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, "../data/recipes.csv");
const outputFilePath = path.join(__dirname, "../data/recipes_fixed.csv");


fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("❌ Error al leer el archivo JSON:", err);
    return;
  }

  try {

    const recipes = JSON.parse(data);


    const headers = Object.keys(recipes[0]);


    const csvRows = recipes.map(recipe =>
      headers.map(header => `"${recipe[header] || ''}"`).join(",")
    );


    const csvContent = [headers.join(","), ...csvRows].join("\n");

    fs.writeFileSync(outputFilePath, csvContent, "utf8");
    console.log("✅ Conversión completada. Nuevo archivo CSV guardado en:", outputFilePath);
  } catch (error) {
    console.error("❌ Error al convertir JSON a CSV:", error);
  }
});
