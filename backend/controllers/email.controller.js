/**
 * Email Controller
 * 
 * This module manages the sending of emails using Nodemailer. It includes:
 * - Creating and configuring an email transporter
 * - Validating required email fields
 * - Building email options for sending
 * - Sending emails through an Express route
 * 
 * It is primarily used for handling contact form submissions.
 */

import nodemailer from 'nodemailer';

/**
 * Creates and configures the email transporter
 * @returns {Object} Nodemailer transporter instance
 */
const createTransporter = () => nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const transporter = createTransporter();

/**
 * Validates required email fields
 * @param {Object} data - Email data object
 * @param {string} data.name - Sender's name
 * @param {string} data.email - Sender's email
 * @param {string} data.subject - Email subject
 * @param {string} data.message - Email message
 * @returns {boolean} Whether all fields are present
 */
const areFieldsValid = ({ name, email, subject, message }) => 
    name && email && subject && message;

/**
 * Builds email options for sending
 * @param {Object} data - Email data object
 * @param {string} data.name - Sender's name
 * @param {string} data.email - Sender's email
 * @param {string} data.subject - Email subject
 * @param {string} data.message - Email message
 * @returns {Object} Nodemailer mail options
 */
const buildMailOptions = ({ name, email, subject, message }) => ({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
    `,
    html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h4>Message:</h4>
        <p>${message.replace(/\n/g, '<br>')}</p>
    `
});

/**
 * Sends an email using the configured transporter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const sendEmail = async (req, res) => {
    try {
        const emailData = req.body;

        if (!areFieldsValid(emailData)) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const mailOptions = buildMailOptions(emailData);
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send email' });
    }
};