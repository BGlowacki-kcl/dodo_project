import admin from '../config/firebase.js';

const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization.split(' ')[1];
    
    if(!idToken){
        return res.status(403).json({ 
            message: 'No token provided' 
        });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        let user = await UserActivation.findOne({ firebaseId: decodedToken.uid });
        next();
    } catch (error){
        res.status(403).json({ error: 'Unauthorized' });
    }
};

export default verifyToken;