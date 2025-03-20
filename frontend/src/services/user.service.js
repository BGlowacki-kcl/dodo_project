import { checkTokenExpiration } from "./auth.service";
const API_BASE_URL = "/api/user";

export const userService = {
    async updateUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error("Failed to update user profile");
            }
            const responseJSON = await response.json();
            checkTokenExpiration(responseJSON);
            return responseJSON;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },

    async getUserProfile() {
        try {
            console.log(sessionStorage.getItem("token"));
            const response = await fetch(`${API_BASE_URL}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
            });

            console.log(response);

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }
            const responseJSON = await response.json();
            checkTokenExpiration(responseJSON);
            return responseJSON;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    async getUserRole() {
        try {
            if(!sessionStorage.getItem("token")){
                return "unLogged";
            }
            const response = await fetch(`${API_BASE_URL}/role`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }

            const responseJson =  await response.json();
            checkTokenExpiration(responseJson);
            const role = responseJson.data;
            return role;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    async getUserId() {
        try {
            const response = await fetch(`${API_BASE_URL}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }

            const responseJson = await response.json();
            checkTokenExpiration(responseJson);
            return responseJson.data._id;
        } catch (error) {
            console.error("Error fetching user ID:", error);
            throw error;
        }
    },

    async getUserById(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/ById?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }
            
            const responseJson = await response.json();
            checkTokenExpiration(responseJson);
            return responseJson.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }
};
