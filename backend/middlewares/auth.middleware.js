import admin from "../config/firebase.js";
import User from "../models/user/user.model.js";

/**
 * Creates a standardized response object
 * @param {boolean} success - Indicates operation success
 * @param {string} message - Response message
 * @param {Object} [data] - Response data (optional)
 * @param {number} [status] - HTTP status code
 * @returns {Object} Standardized response
 */
const createResponse = (success, message, data = null, status = 200) => ({
    success,
    message,
    ...(data && { data }),
    status
});

export const checkRole = (roles) => async (req, res, next) => {
    try {
        const idToken = req.headers.authorization?.split('Bearer ')[1];

        if (!idToken) {
            return res.status(403).json(createResponse(false, 'No token provided', null, 403));
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (!uid) {
            return res.status(403).json(createResponse(false, 'User not found', null, 403));
        }

        if (roles.includes("signUp") || roles.length === 0) {
            req.uid = uid;
            return next();
        }

        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(403).json(createResponse(false, 'User not found', null, 403));
        }

        const userRole = user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json(createResponse(false, 'Forbidden', null, 403));
        }

        req.uid = uid; // Attach user ID to request
        next();
    } catch (error) {
        console.error('Auth error:', error);
        if (error.code === 'auth/argument-error' || error.code === "auth/id-token-expired") {
            return res.status(403).json({ seccess: false, message:  'Token expired', action: 'LOGOUT' });
        }
        return res.status(403).json(createResponse(false, 'Unauthorized', null, 403));
    }
};
