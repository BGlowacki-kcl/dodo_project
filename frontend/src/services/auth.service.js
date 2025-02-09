import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { Navigate } from "react-router-dom";

export const authService = {
    async signUp(email, password, role){
        if(!email || !password){
            throw new Error('Email and password are required');
        }
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        sessionStorage.setItem('token', idToken);
        try{
            const saveToDb = await fetch('/api/user/basic', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    "email": email,
                    "role": role,
                })
            });
            // Delete if user not signed in after signup
            sessionStorage.setItem('role', role);
        } catch(error){
            console.error("SignUp error: ",error);
        }

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
            // const isComplete = await fetch('/api/user/completed', {
            //     method: 'GET',
            //     headers: {
            //         "Content-Type": "application/json",
            //         'Authorization': `Bearer ${idToken}`,
            //     },
            // });
            // if(isComplete.redirect){
            //     console.log("REDIRECTING!")
            //     navigate('/completeProfile');
            // }
            // REDIRET DOES NOT WORK

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
    async checkIfProfileCompleted(navigate){
        try{
            const response = await fetch('/api/user/completed', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            console.log(data)
            if (data.redirect) {
                navigate(data.redirect);
            }
        return response;
        } catch (err) {
            console.log("Error while checking profile completion: ", err);
        }
    }
};