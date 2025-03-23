import React from "react";
import WhiteBox from "./WhiteBox";
import { FaEdit, FaSave, FaTrash, FaPlus, FaGraduationCap, FaBriefcase, FaTools, FaUser } from "react-icons/fa";

const UserDetails = ({ user, isEditing = {}, onEdit, onChange, onAdd, onRemove, isProfilePage }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    return new Date(dateValue).toISOString().split("T")[0];
  };

  return (
    <div>
      {/* Personal Information Section */}
      <WhiteBox className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaUser className="inline-block mr-2" /> Personal Information
          </h2>
          {isProfilePage && (
            isEditing.personal ? (
              <FaSave className="cursor-pointer" onClick={() => onEdit("personal")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => onEdit("personal")} />
            )
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-black">
            <strong>Name:</strong>{" "}
            {isEditing.personal ? (
              <input
                type="text"
                name="name"
                value={user.name || ""}
                onChange={onChange}
                className="border p-1 w-full"
              />
            ) : (
              user.name || "N/A"
            )}
          </p>
          <p className="text-black">
            <strong>Email:</strong>{" "}
            {isEditing.personal ? (
              <input
                type="text"
                name="email"
                value={user.email || ""}
                onChange={onChange}
                className="border p-1 w-full"
              />
            ) : (
              user.email || "N/A"
            )}
          </p>
          <p className="text-black">
            <strong>Phone Number:</strong>{" "}
            {isEditing.personal ? (
              <input
                type="text"
                name="phoneNumber"
                value={user.phoneNumber || ""}
                onChange={onChange}
                className="border p-1 w-full"
              />
            ) : (
              user.phoneNumber || "N/A"
            )}
          </p>
          <p className="text-black">
            <strong>Location:</strong>{" "}
            {isEditing.personal ? (
              <input
                type="text"
                name="location"
                value={user.location || ""}
                onChange={onChange}
                className="border p-1 w-full"
              />
            ) : (
              user.location || "N/A"
            )}
          </p>
        </div>
      </WhiteBox>

      {/* Education Section */}
      <WhiteBox className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaGraduationCap className="inline-block mr-2" /> Education
          </h2>
          {isProfilePage && (
            isEditing.education ? (
              <FaSave className="cursor-pointer" onClick={() => onEdit("education")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => onEdit("education")} />
            )
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.education?.length > 0 ? (
            user.education.map((edu, index) => (
              <div key={index} className="p-4 border rounded-lg mb-4 relative">
                <p className="text-black">
                  <strong>Institution:</strong>{" "}
                  {isEditing.education ? (
                    <input
                      type="text"
                      name={`education.${index}.institution`}
                      value={edu.institution || ""}
                      onChange={onChange}
                      className="border p-1 w-full"
                    />
                  ) : (
                    edu.institution || "N/A"
                  )}
                </p>
                <p className="text-black">
                  <strong>Degree:</strong>{" "}
                  {isEditing.education ? (
                    <input
                      type="text"
                      name={`education.${index}.degree`}
                      value={edu.degree || ""}
                      onChange={onChange}
                      className="border p-1 w-full"
                    />
                  ) : (
                    edu.degree || "N/A"
                  )}
                </p>
                <p className="text-black">
                  <strong>Field of Study:</strong>{" "}
                  {isEditing.education ? (
                    <input
                      type="text"
                      name={`education.${index}.fieldOfStudy`}
                      value={edu.fieldOfStudy || ""}
                      onChange={onChange}
                      className="border p-1 w-full"
                    />
                  ) : (
                    edu.fieldOfStudy || "N/A"
                  )}
                </p>
                <p className="text-black">
                  <strong>Start Date:</strong>{" "}
                  {isEditing.education ? (
                    <input
                      type="date"
                      name={`education.${index}.startDate`}
                      value={formatDateForInput(edu.startDate)}
                      onChange={onChange}
                      className="border p-1 w-full"
                    />
                  ) : (
                    formatDate(edu.startDate)
                  )}
                </p>
                <p className="text-black">
                  <strong>End Date:</strong>{" "}
                  {isEditing.education ? (
                    <input
                      type="date"
                      name={`education.${index}.endDate`}
                      value={formatDateForInput(edu.endDate)}
                      onChange={onChange}
                      className="border p-1 w-full"
                    />
                  ) : (
                    formatDate(edu.endDate)
                  )}
                </p>
                {isEditing.education && (
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
          {isEditing.education && (
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
      <WhiteBox className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaBriefcase className="inline-block mr-2" /> Experience
          </h2>
          {isProfilePage && (
            isEditing.experience ? (
              <FaSave className="cursor-pointer" onClick={() => onEdit("experience")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => onEdit("experience")} />
            )
          )}
        </div>
        <div>
          {user.experience?.length > 0 ? (
            user.experience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg relative">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <p className="text-black">
                      <strong>Company:</strong>{" "}
                      {isEditing.experience ? (
                        <input
                          type="text"
                          name={`experience.${index}.company`}
                          value={exp.company || ""}
                          onChange={onChange}
                          className="border p-1 w-full"
                        />
                      ) : (
                        exp.company || "N/A"
                      )}
                    </p>
                    <p className="text-black">
                      <strong>Title:</strong>{" "}
                      {isEditing.experience ? (
                        <input
                          type="text"
                          name={`experience.${index}.title`}
                          value={exp.title || ""}
                          onChange={onChange}
                          className="border p-1 w-full"
                        />
                      ) : (
                        exp.title || "N/A"
                      )}
                    </p>
                    <p className="text-black">
                      <strong>Start Date:</strong>{" "}
                      {isEditing.experience ? (
                        <input
                          type="date"
                          name={`experience.${index}.startDate`}
                          value={formatDateForInput(exp.startDate)}
                          onChange={onChange}
                          className="border p-1 w-full"
                        />
                      ) : (
                        formatDate(exp.startDate)
                      )}
                    </p>
                    <p className="text-black">
                      <strong>End Date:</strong>{" "}
                      {isEditing.experience ? (
                        <input
                          type="date"
                          name={`experience.${index}.endDate`}
                          value={formatDateForInput(exp.endDate)}
                          onChange={onChange}
                          className="border p-1 w-full"
                        />
                      ) : (
                        formatDate(exp.endDate)
                      )}
                    </p>
                  </div>
                  <div className="flex-1 md:ml-4">
                    <p className="text-black">
                      <strong>Description:</strong>
                    </p>
                    <p className="text-black">
                      {isEditing.experience ? (
                        <textarea
                          name={`experience.${index}.description`}
                          value={exp.description || ""}
                          onChange={onChange}
                          className="border p-1 w-full"
                        />
                      ) : (
                        exp.description || "N/A"
                      )}
                    </p>
                  </div>
                </div>
                {isEditing.experience && (
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
          {isEditing.experience && (
            <button
              className="flex items-center justify-center p-2 border rounded-lg text-blue-500"
              onClick={() => onAdd("experience")}
            >
              <FaPlus className="mr-2" /> Add Experience
            </button>
          )}
          {(!user.experience || user.experience.length === 0) && (
            <p className="text-black italic">No experience details available.</p>
          )}
        </div>
      </WhiteBox>

      {/* Skills Section */}
      <WhiteBox className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            <FaTools className="inline-block mr-2" /> Skills
          </h2>
          {isProfilePage && (
            isEditing.skills ? (
              <FaSave className="cursor-pointer" onClick={() => onEdit("skills")} />
            ) : (
              <FaEdit className="cursor-pointer" onClick={() => onEdit("skills")} />
            )
          )}
        </div>
        {isEditing.skills ? (
          <div>
            {user.skills?.map((skill, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  name={`skills.${index}`}
                  value={skill || ""}
                  onChange={onChange}
                  className="border p-1 flex-1"
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
                <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-black italic">No skills available.</p>
          )
        )}
      </WhiteBox>
    </div>
  );
};

export default UserDetails;
