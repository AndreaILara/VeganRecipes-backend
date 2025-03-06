require("dotenv").config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"Tu Rincón Vegano" <${process.env.EMAIL_USER}>`,
      to: "correo@hotmail.com",
      subject: "Prueba de Correo - Tu Rincón Vegano",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <img src="https://res.cloudinary.com/dyhasskhz/image/upload/v1741272763/Tu_RInc%C3%B3n_vegano_logo_pnbbaq.png" alt="Tu Rincón Vegano" style="max-width: 200px; margin-bottom: 20px;">
          <h2 style="color: #8cc342;">¡Bienvenido a Tu Rincón Vegano!</h2>
          <p style="font-size: 16px;">Estamos emocionados de tenerte aquí. Disfruta de nuestras recetas veganas deliciosas y saludables.</p>
          <a href="https://tu-rincon-vegano.com" style="display: inline-block; padding: 10px 20px; background: #8cc342; color: white; text-decoration: none; border-radius: 5px;">Explorar Recetas</a>
        </div>
      `,
    });

    console.log(`✅ Correo de prueba enviado: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
  }
};


sendTestEmail();
