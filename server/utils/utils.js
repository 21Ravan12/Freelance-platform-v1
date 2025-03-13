const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { emailCredentials } = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailCredentials.user,
    pass: emailCredentials.pass
  }
});

const sendCodeEmail = async (email, code) => {
  const mailOptions = {
    from: emailCredentials.user,
    to: email,
    subject: 'Identification',
    text: `Your identification code is: ${code}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Email error:", err);
    throw new Error(`Failed to send email. ${err.message}`);
  }
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateRandomCode = () => {
  return Math.floor(Math.random() * 999999) + 1;
};

module.exports = { sendCodeEmail, hashPassword, comparePassword, generateRandomCode };
