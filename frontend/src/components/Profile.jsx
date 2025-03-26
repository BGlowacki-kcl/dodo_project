/**
 * Profile.jsx
 *
 * This component represents the Profile Page in the application. It allows users to:
 * - View and edit their personal information, education, experience, and skills.
 * - Parse a new CV to update their profile.
 */

import React, { useEffect, useState } from "react";
import { userService } from "../services/user.service.js";
import { FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserDetails from "./UserDetails";

const Profile = ({ editable }) => {
  // ----------------------------- State Variables -----------------------------
  const [user, setUser] = useState({});
  const [editableUser, setEditableUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState({
    personal: editable || false,
    education: editable || false,
    experience: editable || false,
    skills: editable || false,
    resume: editable || false,
  });
  const navigate = useNavigate();

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches the user's profile data from the backend.
   */
  const fetchUserProfile = async () => {
    try {
      const userData = await userService.getUserProfile();
      setUser({ data: userData });
      setEditableUser(userData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to fetch user profile data when the component mounts.
   */
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ----------------------------- Handlers -----------------------------
  /**
   * Toggles the edit mode for a specific section.
   * @param {String} section - The section to toggle edit mode for.
   */
  const handleEditClick = (section) => {
    setIsEditing((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  /**
   * Handles input changes for editable fields.
   * Supports nested fields for arrays and objects.
   * @param {Object} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parts = name.split(".");
    if (parts.length === 3) {
      const [field, index, subField] = parts;
      const updatedArray = [...(editableUser[field] || [])];
      updatedArray[parseInt(index)] = {
        ...updatedArray[parseInt(index)],
        [subField]: value,
      };
      setEditableUser((prevState) => ({
        ...prevState,
        [field]: updatedArray,
      }));
    } else if (parts.length === 2) {
      const [field, index] = parts;
      const updatedArray = [...(editableUser[field] || [])];
      updatedArray[parseInt(index)] = value;
      setEditableUser((prevState) => ({
        ...prevState,
        [field]: updatedArray,
      }));
    } else {
      setEditableUser((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  /**
   * Saves the updated profile data to the backend.
   * @param {String} section - The section being saved.
   */
  const handleSaveClick = async (section) => {
    try {
      await userService.updateUser(editableUser);
      setUser((prevState) => ({
        ...prevState,
        data: editableUser,
      }));
      setIsEditing((prevState) => ({
        ...prevState,
        [section]: false,
      }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  /**
   * Adds a new item to a specific section (e.g., education, skills).
   * @param {String} section - The section to add an item to.
   */
  const handleAddItem = (section) => {
    setEditableUser((prevState) => ({
      ...prevState,
      [section]: [...prevState[section], section === "skills" ? "" : {}],
    }));
  };

  /**
   * Removes an item from a specific section (e.g., education, skills).
   * @param {String} section - The section to remove an item from.
   * @param {Number} index - The index of the item to remove.
   */
  const handleRemoveItem = (section, index) => {
    setEditableUser((prevState) => ({
      ...prevState,
      [section]: prevState[section].filter((_, i) => i !== index),
    }));
  };

  // ----------------------------- Render -----------------------------
  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Error fetching user profile: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-row items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-left text-black">Profile</h1>
        <div
          className="flex flex-row bg-gray-400 p-3 border-1 border-black rounded-xl cursor-pointer"
          onClick={() => navigate("/addDetails")}
        >
          <FaSave className="cursor-pointer mr-2 mt-1" />
          <span>Parse new CV</span>
        </div>
      </div>

      {/* User Details */}
      <UserDetails
        user={editableUser}
        isEditing={isEditing}
        onEdit={handleEditClick}
        onChange={handleInputChange}
        onAdd={handleAddItem}
        onRemove={handleRemoveItem}
        onSave={handleSaveClick}
        isProfilePage={true}
      />
    </div>
  );
};

export default Profile;