import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";

export const authService = {
    async signUp(email, password, role) {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        sessionStorage.setItem("token", idToken);

        try {
            const saveToDb = await fetch("/api/user/basic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    "email": email,
                    "role": role,
                }),
            });

            if (!saveToDb.ok) {
                throw new Error("Failed to save user to database.");
            }

            sessionStorage.setItem("role", role);
        } catch (error) {
            console.error("SignUp error:", error);
        }
    },

    async signIn(email, password) {
        try {
            if (!email || !password) {
                throw new Error("Email and password are required");
            }

            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            sessionStorage.setItem("token", idToken);

            const roleResponse = await fetch("/api/user/role", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`,
                },
            });

            if (!roleResponse.ok) {
                throw new Error("Failed to fetch user role.");
            }

            const roleData = await roleResponse.json();
            if (roleData.success && roleData.data) {
                sessionStorage.setItem("role", roleData.data);
            } else {
                console.error("Failed to fetch user role:", roleData);
            }

        } catch (error) {
            console.error("SignIn error:", error);
            throw new Error("Invalid email or password");
        }
    },

    async signOut() {
        const auth = getAuth();
        try {
            await signOut(auth);
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("role");
        } catch (error) {
            console.error("Sign out error:", error);
            return { success: false, message: "Sign out not successful" };
        }
    },

    async checkIfProfileCompleted(navigate) {
        try {
            const token = sessionStorage.getItem("token") || "";
            console.log("🔹 Token being sent:", token);  // ✅ Debug token
    
            if (!token) {
                console.warn("No token found, user might not be logged in.");
                return;
            }
    
            const response = await fetch("/api/user/completed", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
            console.log("🔹 Profile completion check:", data);
    
            if (data.redirect) {
                navigate(data.redirect);
            }
            return response;
        } catch (err) {
            console.error("❌ Error checking profile completion:", err);
        }
    },
};
