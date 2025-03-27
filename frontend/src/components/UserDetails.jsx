import React, { useState, useEffect } from "react";
import WhiteBox from "./WhiteBox";
import { FaEdit, FaSave, FaTrash, FaPlus, FaGraduationCap, FaBriefcase, FaTools, FaUser, FaLink } from "react-icons/fa";
import { useNotification } from "../context/notification.context"; // Import useNotification
import { userService } from "../services/user.service";

const UserDetails = ({ user, isEditing = {}, onEdit, onChange, onAdd, onRemove, isProfilePage, editable = false, onSave }) => {
  const [dateError, setDateError] = useState("");
  const showNotification = useNotification(); // Initialize notification hook
  // Track editing state internally if editable prop is true
  const [editingSections, setEditingSections] = useState({
    personal: false,
    links: false,
    education: false,
    experience: false,
    skills: false
  });

  // Set all sections to editable if editable prop is true
  useEffect(() => {
    if (editable) {
      setEditingSections({
        personal: true,
        links: true,
        education: true,
        experience: true,
        skills: true
      });
    }
  }, [editable]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await userService.getUserProfile();
        console.log("User data", userData);
        user.email = userData.email;
      } catch (error) {
        showNotification(error.message || "Failed to fetch user data", "error");
      }
    };

    fetchUserProfile();
  }, []);

  // Get the effective editing state (either from props or internal state)
  const effectiveEditing = editable ? editingSections : isEditing;

  // Handle saving a specific section
  const handleSectionSave = (section) => {
    if (editable) return; // If globally editable, don't handle section saves individually
    console.log("SAving section", section);
    console.log("User", user);
    // Call the parent's onSave handler with the section name and entire user object
    // This allows using the existing updateUser function which expects the complete user object
    console.log("onSave", onSave);
    if (onSave) {
      console.log("Calling onSave");
      onSave(section, user);
      showNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} information updated successfully`, "success");
    }
    
    // Then toggle editing mode off
    if (onEdit) {
      onEdit(section);
    } else {
      setEditingSections(prev => ({
        ...prev,
        [section]: false
      }));
    }
  };

  // Handle internal section editing toggle
  const handleSectionEdit = (section) => {
    if (editable) return; // If globally editable, don't toggle sections
    
    if (onEdit) {
      onEdit(section);
    } else {
      setEditingSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    const date = new Date(dateValue);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const validateDates = (startDate, endDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      const errorMessage = "Start date cannot be after the end date.";
      setDateError(errorMessage);
      showNotification(errorMessage, "error"); // Show error notification
      return false;
    }
    setDateError("");
    return true;
  };

  // Handle nested field changes
  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like "education.0.institution"
      const [section, indexStr, field] = name.split('.');
      const index = parseInt(indexStr, 10);
      
      if (!isNaN(index)) {
        const updatedItems = [...user[section]];
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value
        };
        
        const updatedUser = {
          ...user,
          [section]: updatedItems
        };
        
        onChange({ target: { name: section, value: updatedItems } });
      }
    } else {
      // Handle normal fields
      onChange(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* First Row: Personal Information and Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <WhiteBox>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4 text-black">
              <FaUser className="inline-block mr-2" /> Personal Information
            </h2>
            {isProfilePage && (
              effectiveEditing.personal ? (
                <FaSave
                  className="cursor-pointer"
                  onClick={() => handleSectionSave("personal")}
                />
              ) : (
                <FaEdit
                  className="cursor-pointer"
                  onClick={() => handleSectionEdit("personal")}
                />
              )
            )}
          </div>
          <div className="space-y-2">
            <p className="text-lg text-black">
              <strong>Name:</strong>{" "}
              {effectiveEditing.personal ? (
                <input
                  type="text"
                  name="name"
                  value={user.name || ""}
                  onChange={handleNestedChange}
                  className="border p-1 w-full text-base"
                />
              ) : (
                <span className="text-base">{user.name || "N/A"}</span>
              )}
            </p>
            <p className="text-lg text-black">
              <strong>Email:</strong>{" "}
              {effectiveEditing.personal ? (
                <input
                  readOnly
                  type="text"
                  name="email"
                  value={user.email}
                  className="border p-1 w-full text-base"
                />
              ) : (
                <span className="text-base">{user.email || "N/A"}</span>
              )}
            </p>
            <p className="text-lg text-black">
              <strong>Phone Number:</strong>{" "}
              {effectiveEditing.personal ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={user.phoneNumber || ""}
                  onChange={handleNestedChange}
                  className="border p-1 w-full text-base"
                />
              ) : (
                <span className="text-base">{user.phoneNumber || "N/A"}</span>
              )}
            </p>
            <p className="text-lg text-black">
              <strong>Location:</strong>{" "}
              {effectiveEditing.personal ? (
                <input
                  type="text"
                  name="location"
                  value={user.location || ""}
                  onChange={handleNestedChange}
                  className="border p-1 w-full text-base"
                />
              ) : (
                <span className="text-base">{user.location || "N/A"}</span>
              )}
            </p>
          </div>
        </WhiteBox>

        {/* Links */}
        <WhiteBox>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4 text-black">
              <FaLink className="inline-block mr-2" /> Links
            </h2>
            {isProfilePage && (
              effectiveEditing.links ? (
                <FaSave className="cursor-pointer" onClick={() => handleSectionSave("links")} />
              ) : (
                <FaEdit className="cursor-pointer" onClick={() => handleSectionEdit("links")} />
              )
            )}
          </div>
          <div className="space-y-2">
            <p className="text-lg text-black">
              <strong>GitHub:</strong>{" "}
              {effectiveEditing.links ? (
                <input
                  type="text"
                  name="github"
                  value={user.github || ""}
                  onChange={handleNestedChange}
                  className="border p-1 w-full text-base"
                />
              ) : (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-base"
                >
                  {user.github || "N/A"}
                </a>
              )}
            </p>
            <p className="text-lg text-black">
              <strong>LinkedIn:</strong>{" "}
              {effectiveEditing.links ? (
                <input
                  type="text"
                  name="linkedin"
                  value={user.linkedin || ""}
                  onChange={handleNestedChange}
                  className="border p-1 w-full text-base"
                />
              ) : (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-base"
                >
                  {user.linkedin || "N/A"}
                </a>
              )}
            </p>
          </div>
        </WhiteBox>
      </div>

      {/* Education Section */}
      <WhiteBox>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaGraduationCap className="inline-block mr-2" /> Education
          </h2>
          {isProfilePage && (
            effectiveEditing.education ? (
              <FaSave className="cursor-pointer" onClick={() => handleSectionSave("education")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => handleSectionEdit("education")} />
            )
          )}
        </div>
        <div className="space-y-4">
          {user.education?.length > 0 ? (
            user.education.map((edu, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                <p className="text-lg text-black">
                  <strong>Institution:</strong>{" "}
                  {effectiveEditing.education ? (
                    <input
                      type="text"
                      name={`education.${index}.institution`}
                      value={edu.institution || ""}
                      onChange={handleNestedChange}
                      className="border p-1 w-full text-base"
                    />
                  ) : (
                    <span className="text-base">{edu.institution || "N/A"}</span>
                  )}
                </p>
                <p className="text-lg text-black">
                  <strong>Degree:</strong>{" "}
                  {effectiveEditing.education ? (
                    <input
                      type="text"
                      name={`education.${index}.degree`}
                      value={edu.degree || ""}
                      onChange={handleNestedChange}
                      className="border p-1 w-full text-base"
                    />
                  ) : (
                    <span className="text-base">{edu.degree || "N/A"}</span>
                  )}
                </p>
                <p className="text-lg text-black">
                  <strong>Field of Study:</strong>{" "}
                  {effectiveEditing.education ? (
                    <input
                      type="text"
                      name={`education.${index}.fieldOfStudy`}
                      value={edu.fieldOfStudy || ""}
                      onChange={handleNestedChange}
                      className="border p-1 w-full text-base"
                    />
                  ) : (
                    <span className="text-base">{edu.fieldOfStudy || "N/A"}</span>
                  )}
                </p>
                <p className="text-lg text-black">
                  <strong>Start Date:</strong>{" "}
                  {effectiveEditing.education ? (
                    <input
                      type="date"
                      name={`education.${index}.startDate`}
                      value={formatDateForInput(edu.startDate)}
                      onChange={handleNestedChange}
                      className="border p-1 w-full text-base"
                    />
                  ) : (
                    <span className="text-base">{formatDate(edu.startDate)}</span>
                  )}
                </p>
                <p className="text-lg text-black">
                  <strong>End Date:</strong>{" "}
                  {effectiveEditing.education ? (
                    <input
                      type="date"
                      name={`education.${index}.endDate`}
                      value={formatDateForInput(edu.endDate)}
                      onChange={handleNestedChange}
                      className="border p-1 w-full text-base"
                    />
                  ) : (
                    <span className="text-base">{formatDate(edu.endDate)}</span>
                  )}
                </p>
                {effectiveEditing.education && (
                  <FaTrash
                    className="absolute top-2 right-2 cursor-pointer text-red-500"
                    onClick={() => onRemove("education", index)}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-black italic">No education details available.</p>
          )}
          {effectiveEditing.education && (
            <button
              className="flex items-center justify-center p-2 border rounded-lg text-blue-500"
              onClick={() => onAdd("education")}
            >
              <FaPlus className="mr-2" /> Add Education
            </button>
          )}
        </div>
      </WhiteBox>

      {/* Experience Section */}
      <WhiteBox>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaBriefcase className="inline-block mr-2" /> Experience
          </h2>
          {isProfilePage && (
            effectiveEditing.experience ? (
              <FaSave className="cursor-pointer" onClick={() => handleSectionSave("experience")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => handleSectionEdit("experience")} />
            )
          )}
        </div>
        <div>
          {user.experience?.length > 0 ? (
            user.experience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg relative">
                <div className="flex flex-col md:flex-row justify-between">
                  {/* Left Column: Company, Title, Start Date, End Date */}
                  <div className="flex-1">
                    <p className="text-lg text-black">
                      <strong>Company:</strong>{" "}
                      {effectiveEditing.experience ? (
                        <input
                          type="text"
                          name={`experience.${index}.company`}
                          value={exp.company || ""}
                          onChange={handleNestedChange}
                          className="border p-1 w-full text-base"
                        />
                      ) : (
                        <span className="text-base">{exp.company || "N/A"}</span>
                      )}
                    </p>
                    <p className="text-lg text-black">
                      <strong>Title:</strong>{" "}
                      {effectiveEditing.experience ? (
                        <input
                          type="text"
                          name={`experience.${index}.title`}
                          value={exp.title || ""}
                          onChange={handleNestedChange}
                          className="border p-1 w-full text-base"
                        />
                      ) : (
                        <span className="text-base">{exp.title || "N/A"}</span>
                      )}
                    </p>
                    <p className="text-lg text-black">
                      <strong>Start Date:</strong>{" "}
                      {effectiveEditing.experience ? (
                        <input
                          type="date"
                          name={`experience.${index}.startDate`}
                          value={formatDateForInput(exp.startDate)}
                          onChange={(e) => {
                            const newStartDate = e.target.value;
                            const isValid = validateDates(newStartDate, exp.endDate);
                            if (isValid) handleNestedChange(e);
                          }}
                          className="border p-1 w-full text-base"
                        />
                      ) : (
                        <span className="text-base">{formatDate(exp.startDate)}</span>
                      )}
                    </p>
                    <p className="text-lg text-black">
                      <strong>End Date:</strong>{" "}
                      {effectiveEditing.experience ? (
                        <input
                          type="date"
                          name={`experience.${index}.endDate`}
                          value={formatDateForInput(exp.endDate)}
                          onChange={(e) => {
                            const newEndDate = e.target.value;
                            const isValid = validateDates(exp.startDate, newEndDate);
                            if (isValid) handleNestedChange(e);
                          }}
                          className="border p-1 w-full text-base"
                        />
                      ) : (
                        <span className="text-base">{formatDate(exp.endDate)}</span>
                      )}
                    </p>
                  </div>

                  {/* Right Column: Description */}
                  <div className="flex-1 md:ml-4">
                    <p className="text-lg text-black">
                      <strong>Description:</strong>
                    </p>
                    {effectiveEditing.experience ? (
                      <textarea
                        name={`experience.${index}.description`}
                        value={exp.description || ""}
                        onChange={handleNestedChange}
                        className="border p-1 w-full text-base"
                      />
                    ) : (
                      <p className="text-base text-black">{exp.description || "N/A"}</p>
                    )}
                  </div>
                </div>
                {effectiveEditing.experience && (
                  <FaTrash
                    className="absolute top-2 right-2 cursor-pointer text-red-500"
                    onClick={() => onRemove("experience", index)}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-black italic">No experience details available.</p>
          )}
          {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
          {effectiveEditing.experience && (
            <button
              className="flex items-center justify-center p-2 border rounded-lg text-blue-500"
              onClick={() => onAdd("experience")}
            >
              <FaPlus className="mr-2" /> Add Experience
            </button>
          )}
        </div>
      </WhiteBox>

      {/* Skills Section */}
      <WhiteBox>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaTools className="inline-block mr-2" /> Skills
          </h2>
          {isProfilePage && (
            effectiveEditing.skills ? (
              <FaSave className="cursor-pointer" onClick={() => handleSectionSave("skills")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => handleSectionEdit("skills")} />
            )
          )}
        </div>
        <div className="space-y-4">
          {effectiveEditing.skills ? (
            <div>
              {user.skills?.map((skill, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    name={`skills.${index}`}
                    value={skill || ""}
                    onChange={(e) => {
                      const updatedSkills = [...user.skills];
                      updatedSkills[index] = e.target.value;
                      onChange({ target: { name: "skills", value: updatedSkills } });
                    }}
                    className="border p-1 flex-1 text-base"
                  />
                  <FaTrash
                    className="ml-2 cursor-pointer text-red-500"
                    onClick={() => onRemove("skills", index)}
                  />
                </div>
              ))}
              <button
                className="flex items-center justify-center p-2 border rounded-lg text-blue-500"
                onClick={() => onAdd("skills")}
              >
                <FaPlus className="mr-2" /> Add Skill
              </button>
            </div>
          ) : (
            user.skills?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-200 px-2 py-1 rounded text-base">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-black italic">No skills available.</p>
            )
          )}
        </div>
      </WhiteBox>
    </div>
  );
};

export default UserDetails;