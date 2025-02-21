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

            return await response.json();
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },

    async getUserProfile() {
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

            return await response.json();
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    async getUserRole() {
        try {
            if(!sessionStorage.getItem("token")){
                return {"role": "unLogged" };
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
            const role = responseJson.data;
            return role;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },
};
