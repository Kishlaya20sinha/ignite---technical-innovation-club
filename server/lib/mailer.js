import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp.office365.com' for Outlook/Microsoft if needed
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not found in .env. Skipping email sending.');
        return;
    }

    const mailOptions = {
        from: `"IGNITE Technical Club" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments: arguments[3] || []
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
