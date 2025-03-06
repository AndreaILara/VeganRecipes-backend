const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error en la conexión a MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
