import admin from "../config/firebase.js";
import User from "../models/user/user.model.js";

/**
 * Authentication and authorization middleware
 * Validates Firebase authentication tokens and checks user roles
 * Protects routes based on required permissions
 * @param {Array<String>} roles - Array of authorized roles for the route
 * @returns {Function} Express middleware function
 */
export const checkRole = (roles) => async (req, res, next) => {
        try {
            /**
             * Extract bearer token from authorization header
             */
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                res.status(403).json({ 
                    success: false,
                    message: 'No token provided' 
                });
                return;
            }
            
            /**
             * Verify token with Firebase Admin SDK
             */
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            
            if (!uid) {
                res.status(403).json({ 
                    success: false,
                    message: 'User not found' 
                });
                return;
            }

            /**
             * Special case for signup or public routes
             * Allows token-authenticated users without specific role requirements
             */
            if(roles.includes("signUp") || roles.length == 0 ){
                req.uid = uid;
                next();
                return;
            }

            /**
             * Retrieve user from database to check role
             */
            const user = await User.findOne({ uid: uid });
            if(!user){
                res.status(403).json({ 
                    success: false,
                    message: 'User not found' 
                });
                return;
            }
            const userRole = user.role;

            /**
             * Verify user has required role to access route
             */
            if (!roles.includes(userRole)) {
                console.log('User role:', userRole, " roles: ", roles);
                return res.status(403).json({ message: 'Forbidden' });
            } 
            
            /**
             * Attach user ID to request for use in route handlers
             */
            req.uid = uid;
            next();
        } catch (error) {
            console.error('Auth error:', error);
            /**
             * Handle specific Firebase auth errors
             */
            if (error.code === 'auth/argument-error' || error.code === "auth/id-token-expired") {
                const resp = res.status(403).json({ 
                    success: false, 
                    message: 'Token expired',
                    action: 'LOGOUT'
                });
                console.log("Given resp: ",resp);
                return resp;
            }
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
    }
