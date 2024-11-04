import nodemailer from "nodemailer";
import dotenv from "dotenv";
import handlebars from "handlebars";
import fs from "fs";
dotenv.config();

const forgotPasswordMail = async (token, email) => {
  try {
    const url = "http://localhost:5173/";
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: process.env.MAIL_SERVICE,
      port: 465,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    const emailTemplateSource = fs.readFileSync(
      "./src/views/forgotPassword.hbs",
      "utf-8"
    );
    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({
      urlorcode: `${url}/${token}`,
    });
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: `${email}`,
      subject: "Reset your password",
      text: "Reset password",
      html: htmlToSend,
      // console.log("info--------------------------", info);
      // console.log("Message sent: %s************************", info.messageId);
    });
    console.log(
      "Preview URL: %s-------------------",
      nodemailer.getTestMessageUrl(info)
    );
  } catch (err) {
    console.log(err, "err-------------");
  }
};

export default forgotPasswordMail;
