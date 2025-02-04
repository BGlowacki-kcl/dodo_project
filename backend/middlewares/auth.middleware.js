import admin from "../config/firebase";

export function checkRole(roles) {
    return async function (req, res, next) {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                return res.status(403).json({ 
                    success: false,
                    message: 'No token provided' 
                });
            }
            
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            
            if (!uid) {
                return res.status(403).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }
            
            // TODO: Retrieve user's role and check if roles array includes the role
            // Example: if (!roles.includes(userRole)) return res.status(403).json({ message: 'Forbidden' });
            
            req.uid = uid; // Attach user ID to request
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
    }
}