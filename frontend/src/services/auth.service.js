import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    getAuth 
} from "firebase/auth";
import { auth } from "../firebase.js";
import { verifyUserRole } from "./user.service.js";

export async function checkTokenExpiration(response) {
    if (response.status === 403) {
        const data = await response.json();
        if (data.action === "LOGOUT") {
            authService.signOut();
            window.dispatchEvent(new Event("sessionExpired"));
        }
    }
}
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
    
    async signUp(email, password, isEmployer, navigate){
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        const role = isEmployer ? 'employer' : 'jobSeeker';
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        sessionStorage.setItem('token', idToken);
        window.dispatchEvent(new Event('authChange'));
        try {
            const response = await fetch(`${BASE_URL}/user/basic`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    email: email,
                    role: role,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to save user to database");
            }

            sessionStorage.setItem('role', role);

            //  Check if profile is complete
            await this.checkIfProfileCompleted(navigate);

        } catch (error) {
            console.error("SignUp error: ", error);
            throw new Error("Signup failed");
        }
    },

    async signIn(email, password, navigate, expectedRole){
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        const roleVerification = await verifyUserRole(email, expectedRole);
        console.log("Role verification: "+roleVerification);
        if(!roleVerification){
            console.log("Wrong login page!");
            if(expectedRole === 'employer'){
                throw new Error('Use login page for job seekers');
            } else {
                throw new Error('Use login page for employers');
            }
        }
        console.log("What am I doing here?");

        const auth = getAuth();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            sessionStorage.setItem('token', idToken);
            console.log("Token: "+idToken);
            sessionStorage.setItem('role', expectedRole);  // Ensure correct storage
            window.dispatchEvent(new Event('authChange'));


            //  Check if profile is complete
            if(expectedRole === 'jobSeeker'){
                await this.checkIfProfileCompleted(navigate);
            }
        } catch (error) {
            console.error("SignIn error: ", error);
            throw new Error('Invalid email or password');
        }
    },

    async signOut(){
        const auth = getAuth();
        
        try {
            await signOut(auth);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            window.dispatchEvent(new Event('authChange'));
        } catch (error) {
            console.error("SignOut error:", error);
            throw new Error("Sign out not successful");
        }
    },

    async checkIfProfileCompleted(navigate){
        try {
            const response = await fetch(`${BASE_URL}/user/completed`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to check profile completion");
            }

            const data = await response.json();

            if (data.redirect && sessionStorage.getItem('role') === 'jobSeeker') {
                navigate(data.redirect);  // Ensures navigation works
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error("Error while checking profile completion: ", err);
            navigate('/addDetails');  //  Fallback redirection
        }
    }
};
