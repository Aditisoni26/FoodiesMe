const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail", // or "smtp.yourserver.com"
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false // 👈 disables SSL validation (unsafe for production)
    }
});

module.exports = transporter;