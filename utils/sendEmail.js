
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,             // convert string '587' to number 587
  secure: process.env.EMAIL_SECURE === 'true',             // convert string 'false' to boolean false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendEmail = async (to, otp) => {
  const mailOptions = {
    from: `"DataTricks.Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email - OTP code',
    text: `Your OTP code is ${otp}. It will expire in 15 minutes.`,
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
  };

  console.log('SMTP Config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
});

console.log({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER,
});



  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId} to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
