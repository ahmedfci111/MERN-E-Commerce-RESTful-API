const nodemailer = require("nodemailer");

const sendEmail = async (Option) => {
  try {
    console.log("Sending to:", Option.email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // التأكد من الاتصال بسيرفر Gmail
    await transporter.verify();
    console.log("SMTP Server is ready.");

    const mailOpt = {
      from: `"E-Shop App" <${process.env.EMAIL_USER}>`,
      to: Option.email,
      subject: Option.subject,
      text: Option.message,
    };

    const info = await transporter.sendMail(mailOpt);

    console.log("Email sent successfully.");
    console.log(info.response);

    return info;
  } catch (err) {
    console.error("Error sending email:");
    console.error(err);
    throw err;
  }
};

module.exports = sendEmail;