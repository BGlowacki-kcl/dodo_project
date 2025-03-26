import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ComboBox, Box } from "../../components/LandingComponents";
import job from "../../assets/job.jpg";
import intern from "../../assets/intern.jpg";
import placement from "../../assets/placement.jpg";
import { getJobCountByType, getAllJobTypes, getAllJobRoles, getAllJobLocations } from "../../services/job.service.js";

const Landing = () => {
    const navigate = useNavigate();
    
    const [jobType, setJobType] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");
    
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [types, setTypes] = useState([]);
    
    const [internshipCounter, setInternshipCount] = useState(0);
    const [placementCounter, setPlacementCount] = useState(0);
    const [graduateCounter, setGraduateCount] = useState(0);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [internCount, placeCount, gradCount, jobRoles, jobLocations, jobTypes] = await Promise.all([
                    getJobCountByType("Internship"),
                    getJobCountByType("Placement"),
                    getJobCountByType("Graduate"),
                    getAllJobRoles(),
                    getAllJobLocations(),
                    getAllJobTypes(),
                ]);
                setInternshipCount(internCount);
                setPlacementCount(placeCount);
                setGraduateCount(gradCount);
                setRoles(jobRoles);
                setLocations(jobLocations);
                setTypes(jobTypes);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        if (jobType) queryParams.append("jobType", jobType);
        if (role) queryParams.append("role", role);
        if (location) queryParams.append("location", location);
        navigate(queryParams.toString() ? `/search-results?${queryParams}` : "/search-results");
    };

    const boxSearch = (selectedJobType) => {
        navigate(`/search-results?jobType=${selectedJobType}`);
    };

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen p-10">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-800">Level Up Your <span className="text-blue-500">Tech Career</span></h1>
                <p className="text-gray-600 mt-2 text-lg">Find the perfect opportunity tailored for you</p>
            </div>

            <div className="flex justify-center gap-4 mt-10">
                <ComboBox label="Job Type" options={types} onSelect={setJobType} />
                <ComboBox label="Role" options={roles} onSelect={setRole} />
                <ComboBox label="Location" options={locations} onSelect={setLocation} />
            </div>
            
            <button onClick={handleSearch} className="mt-6 px-20 py-4 bg-blue-500 text-white rounded-lg shadow-md transition ">
                Search Jobs
            </button>
            
            <div className="mt-10 w-full">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        <p className="text-center">Loading...</p>
                    ) : (
                        <>
                            <Box image={intern} text="Internships" counter={internshipCounter} onClick={() => boxSearch("Internship")} />
                            <Box image={placement} text="Placements" counter={placementCounter} onClick={() => boxSearch("Placement")} />
                            <Box image={job} text="Graduate" counter={graduateCounter} onClick={() => boxSearch("Graduate")} />
                        </>
                    )}
                </div>
            </div>

            {/* Footer Section */}
            <div className="w-full mt-20 border-t border-gray-300 py-6 text-center">
                <p className="text-gray-600">Joborithm &copy; {new Date().getFullYear()} - Your gateway to the best career opportunities.</p>
                <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
                    <Link to="/contact" className="hover:text-gray-800 transition">Contact Us</Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;

