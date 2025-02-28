import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComboBox from "../../components/ComboBox";
import Dropdown from "../../components/Dropdown";
import Box from "../../components/Box";
import internship from "../../assets/intern.jpg"
import job from "../../assets/job.jpg"
import placement from "../../assets/placement.jpg"
import { getAllJobs } from "../../services/jobService";

const Landing = () => {
    const navigate = useNavigate();
    
    const [jobType, setJobType] = useState("");
    const [role, setRole] = useState("");
    const [region, setRegion] = useState("");

    const handleSearch = () => {
        const queryParams = new URLSearchParams({
            jobType,
            role,
            region
        }).toString();
        navigate(`/search-results?${queryParams}`);
    };

    return (
        <div className="bg-cover bg-center h-full w-full bg-primary flex flex-col items-center">
            <div className="self-center content-center">
                <p className="text-dtext text-center text-heading font-heading pt-10">LOGO</p>
                <p className="text-secondary text-center text-medium">
                    Find what you're looking for:
                </p>
            </div>
            <div className="flex items-stretch pt-10 self-center content-center gap-4">
                <Dropdown
                    label="Job Type"
                    options={["Graduate", "Full-Time", "Part-Time", "Internship", "Apprenticeship", "Placement"]}
                    onSelect={setJobType}
                />
                <ComboBox
                    label="Role"
                    options={["Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Developer"]}
                    onSelect={setRole}
                />
                <ComboBox
                    label="Region"
                    options={["England", "Scotland", "Wales", "Northern Ireland"]}
                    onSelect={setRegion}
                />
            </div>
            <div className="bg-center">
                <button onClick={handleSearch} className="button w-48">Search</button>
            </div>
            <div className="p-10 flex flex-row gap-10">
                <Box image={internship} text={"Internships"} counter={256} />
                <Box image={placement} text={"Placements"} counter={256} />
                <Box image={job} text={"Jobs"} counter={256} />
            </div>
        </div>
    );
};

export default Landing;
