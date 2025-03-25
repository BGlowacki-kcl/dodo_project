import request from "supertest";
import { app } from "../../app.js";
import chat from "../../api/chat.api.js";
import OpenAI from "openai";

// Fix OpenAI mock setup
jest.mock('openai', () => {
    const mockCreate = jest.fn();
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate
            }
        }
    }));
});

describe('Chat API Controller', () => {
    let req, res, openaiInstance;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        process.env.OPENROUTER_API_KEY = 'mock-api-key';
        openaiInstance = new OpenAI();
        jest.clearAllMocks();
    });

    describe('chat function', () => {
        it('should successfully process a resume query', async () => {
            const mockQuery = "Resume text...";
            const mockCompletion = {
                choices: [{ message: { content: JSON.stringify({}) } }]
            };

            openaiInstance.chat.completions.create.mockResolvedValueOnce(mockCompletion);

            req.body = { query: mockQuery };
            await chat(req, res);

            expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
                model: "meta-llama/llama-3.2-3b-instruct:free",
                messages: expect.arrayContaining([
                    expect.objectContaining({ role: "system" }),
                    expect.objectContaining({ 
                        role: "user", 
                        content: mockQuery 
                    })
                ])
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCompletion
            });
        });

        it('should handle missing query parameter', async () => {
            req.body = {};
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Query is required"
            });
        });

        it('should handle OpenAI API errors', async () => {
            openaiInstance.chat.completions.create.mockRejectedValue(
                new Error('API Error')
            );

            req.body = { query: "Resume text" };

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: expect.stringContaining("Internal server error")
            });
        });

        it('should handle empty response from OpenAI', async () => {
            openaiInstance.chat.completions.create.mockResolvedValue({
                choices: []
            });

            req.body = { query: "Resume text" };

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { choices: [] }
            });
        });

        it('should validate system prompt format', async () => {
            const mockQuery = "Resume text";
            openaiInstance.chat.completions.create.mockImplementation((params) => {
                const systemMessage = params.messages.find(m => m.role === 'system');
                expect(systemMessage.content).toContain('"personal"');
                expect(systemMessage.content).toContain('"experience"');
                expect(systemMessage.content).toContain('"education"');
                expect(systemMessage.content).toContain('"projects"');
                return Promise.resolve({ choices: [{ message: { content: '{}' } }] });
            });

            req.body = { query: mockQuery };
            await chat(req, res);
            
            expect(openaiInstance.chat.completions.create).toHaveBeenCalled();
        });

        it('should handle malformed response from OpenAI', async () => {
            openaiInstance.chat.completions.create.mockResolvedValue({
                malformed: true // Invalid response structure
            });

            req.body = { query: "Resume text" };

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { malformed: true }
            });
        });

        it('should use correct OpenAI configuration', async () => {
            req.body = { query: "Resume text" };
            await chat(req, res);

            expect(OpenAI).toHaveBeenCalledWith({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: "mock-api-key"
            });
        });

        it('should handle large resume texts', async () => {
            const largeText = "A".repeat(10000); // Large resume text
            openaiInstance.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: '{}' } }]
            });

            req.body = { query: largeText };
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle special characters in resume text', async () => {
            const textWithSpecialChars = "Resume with special chars: !@#$%^&*()";
            openaiInstance.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: '{}' } }]
            });

            req.body = { query: textWithSpecialChars };
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle missing API key', async () => {
            process.env.OPENROUTER_API_KEY = '';
            
            req.body = { query: "Resume text" };
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('System Prompt Validation', () => {
        it('should contain all required sections in system prompt', async () => {
            openaiInstance.chat.completions.create.mockImplementation((params) => {
                const systemPrompt = params.messages[0].content;
                
                // Check for required sections
                expect(systemPrompt).toContain('"personal"');
                expect(systemPrompt).toContain('"experience"');
                expect(systemPrompt).toContain('"education"');
                expect(systemPrompt).toContain('"projects"');
                
                // Check for required rules
                expect(systemPrompt).toContain('Rules:');
                expect(systemPrompt).toContain('Strict Formatting');
                expect(systemPrompt).toContain('No Invention');
                expect(systemPrompt).toContain('Correct Association');
                
                return Promise.resolve({ choices: [{ message: { content: '{}' } }] });
            });

            req.body = { query: "Test resume" };
            await chat(req, res);
            
            expect(openaiInstance.chat.completions.create).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors', async () => {
            openaiInstance.chat.completions.create.mockRejectedValue(
                new Error('Network Error')
            );

            req.body = { query: "Resume text" };
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json.mock.calls[0][0].message).toContain('Internal server error');
        });

        it('should handle rate limiting errors', async () => {
            openaiInstance.chat.completions.create.mockRejectedValue(
                new Error('Rate limit exceeded')
            );

            req.body = { query: "Resume text" };
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should handle timeout errors', async () => {
            openaiInstance.chat.completions.create.mockRejectedValue(
                new Error('Request timeout')
            );

            req.body = { query: "Resume text" };
            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
