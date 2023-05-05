require('dotenv').config()

const { Router } = require('express');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
        user: 'klingwolfcameras@gmail.com',
        pass: process.env.EMAIL_PASS,
    },
    secure: true,
});

const sendEmail = (req, res) => {
    const { firstName, email, text } = req.body;
    const mailData = {
        from: 'klingwolfcameras@gmail.com',
        to: 'tylerjgreen22@gmail.com',
        subject: "Comment from: " + firstName,
        text: text + " Return email: " + email
    };

    try {
        transporter.sendMail(mailData, (error, info) => {
            if (error) {
                return console.log(error);
            }
            res.status(200).send({ message: "Comment sent" })
        })
    } catch (error) {
        res.sendStatus(500);
    }

}

const router = Router();

router.post("/", sendEmail);

module.exports = router;