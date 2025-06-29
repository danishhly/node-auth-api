const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    }
});

module.exports = transport