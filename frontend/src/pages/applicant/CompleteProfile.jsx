import React, { useState, useEffect } from "react";

const CompleteProfile = () => {
    const [profile, setProfile] = useState({
        name: "",
        phoneNumber: "",
        dob: "",
        email: "",
        education: [""],
        experience: [""],
        skills: [""]
    });

    const token = sessionStorage.getItem("token");

    // Fetch existing user details
    useEffect(() => {
        async function fetchUserProfile() {
            if (!token) {
                console.warn("🔴 No authentication token found. User might be logged out.");
                return;
            }

            try {
                const response = await fetch("/api/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                console.log("🔹 User Data Fetched:", data);

                if (data.success) {
                    setProfile({
                        name: data.data.name || "",
                        phoneNumber: data.data.phoneNumber || "",
                        dob: data.data.dob || "",
                        email: data.data.email || "",
                        education: Array.isArray(data.data.education) ? data.data.education : [""],
                        experience: Array.isArray(data.data.experience) ? data.data.experience : [""],
                        skills: Array.isArray(data.data.skills) ? data.data.skills : [""],
                    });
                } else {
                    console.error("❌ Error fetching profile:", data.message);
                }
            } catch (error) {
                console.error("❌ Fetch Profile Error:", error);
            }
        }

        fetchUserProfile();
    }, [token]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    // Handle dynamic field updates
    const handleDynamicChange = (index, field, value) => {
        const updatedField = [...profile[field]];
        updatedField[index] = value;
        setProfile({ ...profile, [field]: updatedField });
    };

    // Add new entry in dynamic fields
    const addField = (field) => {
        setProfile({ ...profile, [field]: [...profile[field], ""] });
    };

    // Remove entry in dynamic fields
    const removeField = (field, index) => {
        const updatedField = [...profile[field]];
        updatedField.splice(index, 1);
        setProfile({ ...profile, [field]: updatedField });
    };

    // Submit form to update profile
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        const profileData = {
            name: profile.name.trim(),
            phoneNumber: profile.phoneNumber.trim(),
            dob: profile.dob,
            email: profile.email.trim(),
            education: profile.education.filter(Boolean),  // Ensure it's an array
            experience: profile.experience.filter(Boolean),  // Ensure it's an array
            skills: profile.skills.filter(Boolean),  // Ensure it's an array
        };

        console.log("🔹 Submitting Profile Data:", profileData);

        try {
            const response = await fetch("/api/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();
            console.log("🔹 Response from Backend:", data);

            if (!response.ok) {
                throw new Error(data.message || "Error updating profile");
            }

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("❌ Profile Update Error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-center mb-4">Complete Your Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                />

                <input
                    type="text"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                />

                <label className="text-sm font-medium">Date of Birth</label>
                <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                />

                <input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />

                {/* Education */}
                <label>Education</label>
                {profile.education.map((edu, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={edu}
                            onChange={(e) => handleDynamicChange(index, "education", e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        {index > 0 && (
                            <button type="button" onClick={() => removeField("education", index)} className="text-red-500">✖</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addField("education")} className="w-full bg-blue-500 text-white py-2 rounded-lg">+ Add Education</button>

                {/* Experience */}
                <label>Experience</label>
                {profile.experience.map((exp, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={exp}
                            onChange={(e) => handleDynamicChange(index, "experience", e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        {index > 0 && (
                            <button type="button" onClick={() => removeField("experience", index)} className="text-red-500">✖</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addField("experience")} className="w-full bg-blue-500 text-white py-2 rounded-lg">+ Add Experience</button>

                {/* Skills */}
                <label>Skills</label>
                {profile.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleDynamicChange(index, "skills", e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        {index > 0 && (
                            <button type="button" onClick={() => removeField("skills", index)} className="text-red-500">✖</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addField("skills")} className="w-full bg-blue-500 text-white py-2 rounded-lg">+ Add Skill</button>

                <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg">Save Profile</button>
            </form>
        </div>
    );
};

export default CompleteProfile;
