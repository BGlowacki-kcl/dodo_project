import React from "react";
import ComboBox from "../components/ComboBox";
import Dropdown from "../components/Dropdown";

const LandingPage = () => {
    const handleSearch = (searchTerm) => {
        console.log("Search term:", searchTerm); // Handle search logic here
    };

    return (
        <div className="bg-cover bg-center h-64 w-full bg-slate-900 flex flex-col items-center">
            <div className="self-center content-center">
                <p className="text-white text-center text-5xl font-mono pt-10 pl-10">LOGO</p>
                <p className="text-stone-200 text-center text-2xl font-mono pl-10">
                    Find what you're looking for:
                </p>
            </div>
            <div className="flex items-stretch pt-10 pl-10 self-center content-center gap-4">
                <Dropdown 
                    label="Job Type"
                    options={["Graduate", "Full-Time", "Part-Time", "Internship", "Apprenticeship", "Placement"]}
                />
                <ComboBox
                    label="Option 2"
                    options={["Option 1", "Option 2", "Option 3", "Option 4"]}
                />
                <ComboBox
                    label="Region"
                    options={["England", "Scotland", "Wales", "Northern Ireland"]}
                />
               
            </div>
        </div>
    );
};

export default LandingPage;



