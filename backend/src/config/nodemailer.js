const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.in',
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

module.exports = transporter