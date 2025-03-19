import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComboBox from "../../components/ComboBox";
import Box from "../../components/Box";
import job from "../../assets/job.jpg";
import internship from "../../assets/intern.jpg";
import placement from "../../assets/placement.jpg";
import { getJobCountByType, getAllJobTypes, getAllJobRoles, getAllJobLocations } from "../../services/jobService";

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
        const fetchCount = async () => {
          try {
            setInternshipCount(await getJobCountByType("Internship"));
            setPlacementCount(await getJobCountByType("Placement"));
            setGraduateCount(await getJobCountByType("Graduate"));
          } catch (error) {
            console.error("Failed to fetch internship count", error);
          }
        };

        const fetchRoles = async () => {
          try {
            setRoles(await getAllJobRoles());
          } catch (error) {
            console.error("Failed to fetch job titles", error);
          }
        };

        const fetchLocations = async () => {
            try {
                setLocations(await getAllJobLocations());
            } catch (error) {
                console.error("Failed to fetch job locations", error);
            }
        };

        const fetchTypes = async () => {
            try {
                setTypes(await getAllJobTypes());
            } catch (error) {
                console.error("Failed to fetch job types", error);
            }
        };
    
        fetchCount();
        fetchRoles();
        fetchLocations();
        fetchTypes();
    }, []);

    return (
        <div className="bg-cover bg-center h-full w-full bg-background flex flex-col items-center">
            <div className="self-center content-center">
                <p className="text-dtext text-center text-heading font-heading pt-10">JOBORITHM</p>
                <p className="text-secondary text-center text-medium">
                    Find what you're looking for:
                </p>
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-stretch pt-10 self-center content-center gap-4">
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

            {/* Search Button */}
            <div className="bg-center">
                <button onClick={handleSearch} className="button w-48">Search</button>
            </div>

            {/* Job Type Boxes (Now Functional) */}
            <div className="p-10 flex flex-row gap-10">
                <Box image={internship} text={"Internships"} counter={internshipCounter} onClick={() => boxSearch("Internship")} />
                <Box image={placement} text={"Placements"} counter={placementCounter} onClick={() => boxSearch("Placement")} />
                <Box image={job} text={"Graduate"} counter={graduateCounter} onClick={() => boxSearch("Graduate")} />
            </div>
        </div>
    );
};

export default Landing;
