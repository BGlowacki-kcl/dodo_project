import { sendEmail } from '../../controllers/email.controller.js';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn()
    })
}));

describe('Email Controller', () => {
    let req, res, mockTransporter;

    beforeEach(() => {
        // Reset mocks and environment
        process.env.EMAIL_SERVICE = 'gmail';
        process.env.EMAIL_USER = 'test@example.com';
        process.env.EMAIL_PASS = 'testpass';

        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Setup mock transporter
        mockTransporter = {
            sendMail: jest.fn()
        };
        nodemailer.createTransport.mockReturnValue(mockTransporter);

        jest.clearAllMocks();
    });

    describe('sendEmail', () => {
        it('should successfully send email with valid data', async () => {
            const emailData = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };
            req.body = emailData;
            mockTransporter.sendMail.mockResolvedValue(true);

            await sendEmail(req, res);

            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                replyTo: emailData.email,
                subject: `Contact Form: ${emailData.subject}`,
                text: expect.stringContaining(emailData.message),
                html: expect.stringContaining(emailData.message)
            }));

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email sent successfully'
            });
        });

        it('should return 400 if required fields are missing', async () => {
            const testCases = [
                { name: 'Test User' },
                { name: 'Test User', email: 'test@test.com' },
                { name: 'Test User', email: 'test@test.com', subject: 'Test' },
                { email: 'test@test.com', subject: 'Test', message: 'Test' },
            ];

            for (const testCase of testCases) {
                req.body = testCase;
                await sendEmail(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: 'All fields are required'
                });

                jest.clearAllMocks();
            }
        });

        it('should handle email sending errors', async () => {
            req.body = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };
            mockTransporter.sendMail.mockRejectedValue(new Error('Failed to send'));

            await sendEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to send email'
            });
        });

        it('should handle missing environment variables', async () => {
            delete process.env.EMAIL_USER;
            
            req.body = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };

            await sendEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to send email'
            });
        });

        it('should properly format HTML message with newlines', async () => {
            const emailData = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Line 1\nLine 2\nLine 3'
            };
            req.body = emailData;
            mockTransporter.sendMail.mockResolvedValue(true);

            await sendEmail(req, res);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Line 1<br>Line 2<br>Line 3')
                })
            );
        });

        it('should include all required sections in email template', async () => {
            const emailData = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };
            req.body = emailData;
            mockTransporter.sendMail.mockResolvedValue(true);

            await sendEmail(req, res);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('<h3>New Contact Form Submission</h3>')
                })
            );

            const mailOptions = mockTransporter.sendMail.mock.calls[0][0];
            expect(mailOptions.html).toContain('<strong>Name:</strong>');
            expect(mailOptions.html).toContain('<strong>Email:</strong>');
            expect(mailOptions.html).toContain('<strong>Subject:</strong>');
            expect(mailOptions.html).toContain('<h4>Message:</h4>');
        });

        it('should handle special characters in email content', async () => {
            const emailData = {
                name: 'Test User <script>',
                email: 'sender@test.com',
                subject: 'Test & Subject',
                message: 'Test Message with & < > " \' symbols'
            };
            req.body = emailData;
            mockTransporter.sendMail.mockResolvedValue(true);

            await sendEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(mockTransporter.sendMail).toHaveBeenCalled();
        });

        it('should handle very long messages', async () => {
            const longMessage = 'A'.repeat(5000);
            req.body = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: longMessage
            };
            mockTransporter.sendMail.mockResolvedValue(true);

            await sendEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(mockTransporter.sendMail).toHaveBeenCalled();
        });
    });

    describe('Email Configuration', () => {
        it('should create transporter with correct configuration', async () => {
            req.body = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };

            await sendEmail(req, res);

            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        });

        it('should use environment variables for configuration', async () => {
            process.env.EMAIL_SERVICE = 'custom-service';
            process.env.EMAIL_USER = 'custom@example.com';
            process.env.EMAIL_PASS = 'custompass';

            req.body = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };

            await sendEmail(req, res);

            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                expect.objectContaining({
                    service: 'custom-service',
                    host: 'smtp.gmail.com',
                    auth: {
                        user: 'custom@example.com',
                        pass: 'custompass'
                    }
                })
            );
        });

        it('should default EMAIL_SERVICE to "gmail" if not set', async () => {
            delete process.env.EMAIL_SERVICE; // Unset EMAIL_SERVICE
            req.body = {
                name: 'Test User',
                email: 'sender@test.com',
                subject: 'Test Subject',
                message: 'Test Message'
            };

            await sendEmail(req, res);

            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                expect.objectContaining({
                    service: 'gmail', // Default value
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                })
            );
        });
    });
});
