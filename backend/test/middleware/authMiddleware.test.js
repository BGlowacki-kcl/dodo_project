import { checkRole } from "../../middlewares/auth.middleware.js";
import admin from "../../config/firebase.js";
import User from "../../models/user/user.model.js";

// Mock Firebase admin
jest.mock("../../config/firebase.js", () => ({
    auth: () => ({
        verifyIdToken: jest.fn()
    })
}));

// Mock User model
jest.mock("../../models/user/user.model.js", () => ({
    findOne: jest.fn()
}));

describe("Auth Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer valid-token'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe("checkRole", () => {
        it("should allow access for empty roles array", async () => {
            const middleware = checkRole([]);
            // Mock the decoded token with a uid
            admin.auth().verifyIdToken.mockResolvedValue({ uid: 'test-uid' });

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.uid).toBe('test-uid');
        });

        it("should allow access for signUp role", async () => {
            const middleware = checkRole(['signUp']);
            admin.auth().verifyIdToken.mockResolvedValue({ uid: 'test-uid' });

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.uid).toBe('test-uid');
        });

        it("should allow access if user role matches", async () => {
            const middleware = checkRole(['admin']);
            admin.auth().verifyIdToken.mockResolvedValue({ uid: 'test-uid' });
            User.findOne.mockResolvedValue({ role: 'admin' });

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.uid).toBe('test-uid');
        });

        it("should deny access if no token provided", async () => {
            req.headers.authorization = undefined;
            const middleware = checkRole(['admin']);

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided',
                status: 403
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should deny access if token verification fails", async () => {
            const middleware = checkRole(['admin']);
            admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized',
                status: 403
            });
        });

        it("should handle expired token", async () => {
            const middleware = checkRole(['admin']);
            const error = new Error('Token expired');
            error.code = 'auth/id-token-expired';
            admin.auth().verifyIdToken.mockRejectedValue(error);

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token expired',
                data: { action: 'LOGOUT' },
                status: 403
            });
        });

        it("should deny access if user not found in database", async () => {
            const middleware = checkRole(['admin']);
            admin.auth().verifyIdToken.mockResolvedValue({ uid: 'test-uid' });
            User.findOne.mockResolvedValue(null);

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found',
                status: 403
            });
        });

        it("should deny access if user role doesn't match", async () => {
            const middleware = checkRole(['admin']);
            admin.auth().verifyIdToken.mockResolvedValue({ uid: 'test-uid' });
            User.findOne.mockResolvedValue({ role: 'user' });

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Forbidden',
                status: 403
            });
        });

        it("should handle database errors", async () => {
            const middleware = checkRole(['admin']);
            admin.auth().verifyIdToken.mockResolvedValue({ uid: 'test-uid' });
            User.findOne.mockRejectedValue(new Error('Database error'));

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized',
                status: 403
            });
        });
    });
});
