import React from "react";
import ComboBox from "../../components/ComboBox";
import Dropdown from "../../components/Dropdown";
import Box from "../../components/Box";
import internship from "../../assets/intern.jpg"
import job from "../../assets/job.jpg"
import placement from "../../assets/placement.jpg"
import { getAllJobs } from "../../services/jobService";

const Landing = () => {
    const handleSearch = (searchTerm) => {
        console.log("Search term:", searchTerm);
    };

    return (
        <div className="bg-cover bg-center h-full w-full bg-[#0c1821] flex flex-col items-center">
            <div className="self-center content-center">
                <p className="text-white text-center text-5xl font-mono pt-10 pl-10">LOGO</p>
                <p className="text-[#ccc9dc] text-center text-2xl font-mono pl-10">
                    Find what you're looking for:
                </p>
            </div>
            <div className="flex items-stretch pt-10 pl-10 self-center content-center gap-4">
                <Dropdown 
                    label="Job Type"
                    options={["Graduate", "Full-Time", "Part-Time", "Internship", "Apprenticeship", "Placement"]}
                />
                <ComboBox
                    label="Role"
                    options={["Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Developer"]}
                />
                <ComboBox
                    label="Region"
                    options={["England", "Scotland", "Wales", "Northern Ireland"]}
                />
               
            </div>
            {/*TODO: change couunter to make it out how many from the actual db
                     add onclick to the 3 buttons so it takes you to the respective pages*/}
            <div className="p-10 flex flex-row gap-10">
                <Box image={internship} text={"Internships"} counter={256}/>
                <Box image={placement} text={"Placements"} counter={256}/>
                <Box image={job} text={"Jobs"} counter={256}/>
            </div>

        </div>
    );
};

export default Landing;