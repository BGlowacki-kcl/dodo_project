import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const userData = await userService.getUserProfile();
                setUser(userData);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }

        fetchUserProfile();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error fetching user profile: {error.message}</p>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Phone Number: {user.phoneNumber}</p>
            <p>Location: {user.location}</p>
        </div>
    );
};

export default Profile;