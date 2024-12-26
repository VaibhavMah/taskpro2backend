const nodemailer = require('nodemailer');

const sendEmail = async (to, title, dueDate, priority) => {
  try {
    console.log(to); // Make sure this prints a valid email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // App-specific password or Gmail password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'New Task Notification',
      text: `Task "${title}" is due on ${dueDate} with priority ${priority}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(to)
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
