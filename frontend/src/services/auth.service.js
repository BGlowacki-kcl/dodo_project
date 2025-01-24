import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const authService = {
    async signUp(email, password){
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);
        return await authService.sendTokenToBackend(idToken, 'signup');
    },

    async signIn(email, password){
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);
        return await authService.sendTokenToBackend(idToken, 'signin');
    },

    async signOut(){
        await signOut(auth);
        localStorage.removeItem('token');
    },

    async sendTokenToBackend(token, endpoint){
        const response = await fetch(`/api/auth/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if(!response.ok){
            throw new Error('Failed to authenticate');
        }
        return response.json();
    }
};