const nodemailer = require("nodemailer");
require("dotenv").config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Vegan Recipes" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado: ", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error enviando email: ", error);
    return { success: false, error };
  }
};

module.exports = { sendEmail };
