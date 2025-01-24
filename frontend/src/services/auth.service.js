import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const authService = {
    async signUp(email, password){
        if(!email || !password){
            throw new Error('Email and password are required');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);
    },

    async signIn(email, password){
        try {
            if(!email || !password){
                throw new Error('Email and password are required');
            }
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            console.log('idToken', idToken);
            localStorage.setItem('token', idToken);
        } catch (error){
            throw new Error('Invalid email or password');
        }
    },

    async signOut(){
        if(!auth.currentUser){
            throw new Error('No user signed in');
        }
        await signOut(auth);
        localStorage.removeItem('token');
    },
};