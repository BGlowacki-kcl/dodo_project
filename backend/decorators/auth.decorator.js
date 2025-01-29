export function Roles(roles) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req, res, next){
            try {
                const idToken = req.header.authorization;
                if(!idToken) {
                    return res.status(403).json({ 
                        success: false,
                        message: 'No token provided' 
                    });
                }
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                let user = await UserActivation.findOne({ firebaseId: decodedToken.uid });
                
                if(!user) {
                    return res.status(403).json({ 
                        success: false,
                        message: 'User not found' 
                    });
                }
                // TODO: Retrive user's role and check if roles array has this value

                req.user = user; // User is added to the request
                return originalMethod.apply(this, [req, res, next]);
            } catch (error) {
                console.error('Auth error:', error);
                return res.status(403).json({ 
                    success: false,
                    message: 'Unauthorized' 
                });
            }
        }
    }
}