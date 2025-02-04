import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";

export const authService = {
    async signUp(email, password){
        if(!email || !password){
            throw new Error('Email and password are required');
        }
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        sessionStorage.setItem('token', idToken);
        const role = await fetch('/api/user/role', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${idToken}`,
            },
        });
        sessionStorage.setItem('role', role);
    },

    async signIn(email, password){
        try {
            if(!email || !password){
                throw new Error('Email and password are required');
            }
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            console.log('idToken', idToken);
            sessionStorage.setItem('token', idToken);
            const role = await fetch('/api/user/role', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${idToken}`,
                },
            });
            sessionStorage.setItem('role', role);
        } catch (error){
            throw new Error('Invalid email or password');
        }
    },

    async signOut(){
        const auth = getAuth();
        await signOut(auth).then(() => {
            sessionStorage.removeItem('token');
        }).catch((error) => {
            console.error(error);
            return({ success: false, message:"Sign out not successful"});
        });
        
    },
    async checkIfProfileCompleted(){
        const response = await fetch('/api/user/completed', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${sessionStorage.getItem('idToken')}`,
            },
        });
        return response;
    }
};