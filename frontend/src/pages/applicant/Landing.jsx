import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComboBox, Box } from "../../components/LandingComponents";
import job from "../../assets/job.jpg";
import internship from "../../assets/intern.jpg";
import placement from "../../assets/placement.jpg";
import { getJobCountByType, getAllJobTypes, getAllJobRoles, getAllJobLocations } from "../../services/jobService";
import WhiteBox from "../../components/WhiteBox";

const Landing = () => {
    const navigate = useNavigate();
    
    // URL parameters
    const [jobType, setJobType] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");

    // Dropdown menus
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [types, setTypes] = useState([]);

    // Job type counters
    const [internshipCounter, setInternshipCount] = useState(0);
    const [placementCounter, setPlacementCount] = useState(0);
    const [graduateCounter, setGraduateCount] = useState(0);

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        if (jobType) queryParams.append("jobType", jobType);
        if (role) queryParams.append("role", role);
        if (location) queryParams.append("location", location);
        const queryString = queryParams.toString();
        navigate(queryString ? `/search-results?${queryString}` : "/search-results");
    };

    const boxSearch = (selectedJobType) => {
        navigate(`/search-results?jobType=${selectedJobType}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true); // Start loading

                // Fetch all data concurrently
                const [internCount, placeCount, gradCount, jobRoles, jobLocations, jobTypes] = await Promise.all([
                    getJobCountByType("Internship"),
                    getJobCountByType("Placement"),
                    getJobCountByType("Graduate"),
                    getAllJobRoles(),
                    getAllJobLocations(),
                    getAllJobTypes(),
                ]);

                // Set all states at once
                setInternshipCount(internCount);
                setPlacementCount(placeCount);
                setGraduateCount(gradCount);
                setRoles(jobRoles);
                setLocations(jobLocations);
                setTypes(jobTypes);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false); // Stop loading
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Welcome to Joborithm</h1>
                <p className="text-lg text-gray-600">Find the perfect job tailored to your skills and preferences</p>
            </div>

            {/* Dropdown Filters */}
            <WhiteBox className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Search for Jobs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0"> {/* Removed gap to make them touch */}
                    <ComboBox
                        label="Job Type"
                        options={types}
                        onSelect={setJobType}
                    />
                    <ComboBox
                        label="Role"
                        options={roles}
                        onSelect={setRole}
                    />
                    <ComboBox
                        label="Location"
                        options={locations}
                        onSelect={setLocation}
                    />
                </div>
                <div className="flex justify-center mt-6">
                    <button onClick={handleSearch} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                        Search
                    </button>
                </div>
            </WhiteBox>

            {/* Job Type Boxes */}
            <WhiteBox>
                <h2 className="text-2xl font-semibold text-center mb-6">Explore Job Types</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : (
                        <>
                            <Box
                                image={internship}
                                text={"Internships"}
                                counter={internshipCounter}
                                onClick={() => boxSearch("Internship")}
                            />
                            <Box
                                image={placement}
                                text={"Placements"}
                                counter={placementCounter}
                                onClick={() => boxSearch("Placement")}
                            />
                            <Box
                                image={job}
                                text={"Graduate"}
                                counter={graduateCounter}
                                onClick={() => boxSearch("Graduate")}
                            />
                        </>
                    )}
                </div>
            </WhiteBox>
        </div>
    );
};

export default Landing;