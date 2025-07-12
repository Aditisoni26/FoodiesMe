const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail", // or "smtp.gmail.com"
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // Only for development
    }
});

module.exports = transporter;