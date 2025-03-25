import admin from "../config/firebase.js";
import User from "../models/user/user.model.js";

export const checkRole = (roles) => async (req, res, next) => {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                res.status(403).json({ 
                    success: false,
                    message: 'No token provided' 
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

            if(roles.includes("signUp") || roles.length == 0 ){
                req.uid = uid;
                next();
                return;
            }
            const user = await User.findOne({ uid: uid });
            if(!user){
                res.status(403).json({ 
                    success: false,
                    message: 'User not found' 
                });
                return;
            }
            const userRole = user.role;

            if (!roles.includes(userRole)) {
                console.log('User role:', userRole, " roles: ", roles);
                return res.status(403).json({ message: 'Forbidden' });
            } 
            
            req.uid = uid; // Attach user ID to request
            next();
        } catch (error) {
            console.error('Auth error:', error);
            if (error.code === 'auth/argument-error' || error.code === "auth/id-token-expired") {
                const resp = res.status(403).json({ 
                    success: false, 
                    message: 'Token expired',
                    action: 'LOGOUT'
                });
                return resp;
            }
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
    }
