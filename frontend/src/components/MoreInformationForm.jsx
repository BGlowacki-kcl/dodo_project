import React from 'react'

    const renderData = (text) => {
        if (!text) return null;
    
        return (
            <div className="border-2 border-black p-4 mt-4 w-96">
                <h2 className="text-lg font-bold">Parsed Resume</h2>
    
                {/* Personal Info */}
                <h3 className="font-semibold mt-2">Personal Information</h3>
                <p><strong>Name:</strong> {text.personal?.name} {text.data?.personal?.surname}</p>
                <p><strong>Location:</strong> {text.personal?.location}</p>
                <p><strong>Portfolio:</strong> {text.personal?.["portfolio website"]}</p>
                <p><strong>LinkedIn:</strong> {text.personal?.["LinkedIn website"]}</p>
                <p><strong>GitHub:</strong> {text.personal?.["GitHub website"]}</p>
    
                {/* Experience Section */}
                <h3 className="font-semibold mt-2">Experience</h3>
                {text.experience?.map((job, index) => (
                    <div key={index} className="border p-2 mt-2">
                        <p><strong>Company:</strong> {job.company}</p>
                        <p><strong>Position:</strong> {job.position}</p>
                        <p><strong>Skills:</strong> {job.skills}</p>
                        <p><strong>Duration:</strong> {job["start date"]} - {job["end date"]}</p>
                        <p><strong>Description:</strong> {job.description}</p>
                    </div>
                ))}
    
                {/* Education Section */}
                <h3 className="font-semibold mt-2">Education</h3>
                {text.education?.map((edu, index) => (
                    <div key={index} className="border p-2 mt-2">
                        <p><strong>University:</strong> {edu.University}</p>
                        <p><strong>Major:</strong> {edu.Major}</p>
                        <p><strong>Degree:</strong> {edu.Degree}</p>
                        <p><strong>Duration:</strong> {edu["start date"]} - {edu["end date"]}</p>
                    </div>
                ))}
    
                {/* Projects Section */}
                <h3 className="font-semibold mt-2">Projects</h3>
                {text.projects?.map((project, index) => (
                    <div key={index} className="border p-2 mt-2">
                        <p><strong>Name:</strong> {project.name}</p>
                        <p><strong>Skills:</strong> {project.skills}</p>
                        <p><strong>Description:</strong> {project.description}</p>
                    </div>
                ))}
            </div>
        );
    };  

export default renderData;