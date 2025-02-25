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

            if(roles.includes("signUp")){
                req.uid = uid;
                next();
            }
            
            const user = await User.findOne({ uid: uid });
            console.log(user);
            console.log(uid);
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
