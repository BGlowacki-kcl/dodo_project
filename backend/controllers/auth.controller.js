export const authController = {
    async signUp(req, res){
        try {
            const { firebaseId, email } = req.user;
            res.status(201).json({
                message: "Signup successful",
                user: { firebaseId, email }
            });
        } catch (error){
            res.status(500).json({ error: error.message });
        }
    },

    async signIn(req, res) {
        try {
            const { firebaseId, email } = req.user;
            
            res.json({
                message: "Signin successful",
                user: { firebaseId, email }
            });
        } catch (error){
            res.status(500).json({ error: error.message });
        }
    }
}
