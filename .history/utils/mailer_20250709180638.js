const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail", // or "Yahoo", "Outlook", etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

module.exports = transporter;