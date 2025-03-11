const express = require("express");
const router = express.Router();
const { sendEmail } = require("../../utils/email");



router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios." });
  }

  try {
    const emailResponse = await sendEmail(
      "vegan.recipes.spain@gmail.com",
      `Nuevo mensaje de contacto: ${subject}`,
      `De: ${name} (${email})\n\n${message}`
    );

    if (emailResponse.success) {
      return res.json({ success: true, message: "Mensaje enviado correctamente." });
    } else {
      return res.status(500).json({ success: false, message: "Error al enviar el mensaje." });
    }
  } catch (error) {
    console.error("Error en el contacto:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor." });
  }
});

module.exports = router;
