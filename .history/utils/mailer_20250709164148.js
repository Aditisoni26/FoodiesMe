const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_ID, // your email
        pass: process.env.EMAIL_PASS, // your app password (not Gmail login)
    },
});

module.exports = transporter;