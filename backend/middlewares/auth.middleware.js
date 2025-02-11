import admin from "../config/firebase.js";
import User from "../models/user/user.model.js";

export function checkRole(roles) {
    return async function (req, res, next) {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                res.status(403).json({ 
                    success: false,
                    message: 'No token provided1' 
                });
                return;
            }
            
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            
            if (!uid) {
                res.status(403).json({ 
                    success: false,
                    message: 'User not found' 
                });
                return;
            }
            
            const user = User.findOne({ uid: uid });
            const userRole = user.role;

            // if (roles.length() == 0 || !roles.includes(userRole)) {
            //     return res.status(403).json({ message: 'Forbidden' });
            // } 
            
            req.uid = uid; // Attach user ID to request
            next();
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
    }
}