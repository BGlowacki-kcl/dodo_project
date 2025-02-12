import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    getAuth 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const authService = {
    
    async signUp(email, password, role, navigate){
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        sessionStorage.setItem('token', idToken);

        try {
            const response = await fetch('/api/user/basic', {
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

    async signIn(email, password, navigate){
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const auth = getAuth();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            sessionStorage.setItem('token', idToken);

            //  Fetch role from backend
            const roleResponse = await fetch('/api/user/role', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (!roleResponse.ok) {
                throw new Error("Failed to fetch user role");
            }

            const roleData = await roleResponse.json();
            sessionStorage.setItem('role', roleData.data);  // Ensure correct storage

            //  Check if profile is complete
            await this.checkIfProfileCompleted(navigate);

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
        } catch (error) {
            console.error("SignOut error:", error);
            throw new Error("Sign out not successful");
        }
    },

    async checkIfProfileCompleted(navigate){
        try {
            const response = await fetch('/api/user/completed', {
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
            console.log("Profile completion check:", data);

            if (data.redirect) {
                navigate(data.redirect);  // Ensures navigation works
            } else {
                navigate('/dashboard');  // Defaults to dashboard if complete
            }

        } catch (err) {
            console.error("Error while checking profile completion: ", err);
            navigate('/addDetails');  //  Fallback redirection
        }
    }
};
