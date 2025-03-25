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
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Missing email configuration');
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Validates required email fields
 * @param {Object} data - Email data object
 * @returns {boolean} Whether all fields are present
 */
const areFieldsValid = (data = {}) => {
    const { name, email, subject, message } = data;
    return Boolean(name && email && subject && message);
};

/**
 * Sanitizes HTML to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeHTML = (input) => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * Builds email options for sending
 * @param {Object} data - Email data object
 * @returns {Object} Nodemailer mail options
 */
const buildMailOptions = (data) => {
    const { name, email, subject, message } = data;
    
    const sanitizedName = sanitizeHTML(name);
    const sanitizedEmail = sanitizeHTML(email);
    const sanitizedSubject = sanitizeHTML(subject);
    
    const formattedMessage = message.replace(/\n/g, '<br>');

    return {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `Contact Form: ${sanitizedSubject}`,
        text: `
            Name: ${sanitizedName}
            Email: ${sanitizedEmail}
            
            Message:
            ${message}
        `,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
            <h4>Message:</h4>
            <p>${formattedMessage}</p>
        `
    };
};

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

        const transporter = createTransporter();

        const mailOptions = buildMailOptions(emailData);
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ error: 'Failed to send email' });
    }
};