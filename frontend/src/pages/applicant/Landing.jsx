import { useNavigate } from "react-router-dom";
import ComboBox from "../../components/ComboBox";
import Dropdown from "../../components/Dropdown";
import Box from "../../components/Box";
import internship from "../../assets/intern.jpg";
import job from "../../assets/job.jpg";
import placement from "../../assets/placement.jpg";

const Landing = () => {
    const navigate = useNavigate();

    const handleSearch = (searchTerm) => {
        console.log("Search term:", searchTerm);
    };

    const navigateToJobs = () => {
        navigate("/user/jobs");
    };

    return (
        <div className="bg-cover bg-center h-full w-full bg-slate-900 flex flex-col items-center">
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
                    label="Role"
                    options={["Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Developer"]}
                />
                <ComboBox
                    label="Region"
                    options={["England", "Scotland", "Wales", "Northern Ireland"]}
                />
            </div>
            <div className="p-10 flex flex-row gap-10">
                <Box image={internship} text="Internships" counter={256} onClick={navigateToJobs} />
                <Box image={placement} text="Placements" counter={256} onClick={navigateToJobs} />
                <Box image={job} text="Jobs" counter={256} onClick={navigateToJobs} />
            </div>
        </div>
    );
};

export default Landing;








