import React, {useEffect, useState} from "react";
import SwipeBox from "../../components/SwipeBox";
import SwipeFilters from "../../components/SwipeFilters";
import amazon from "../../assets/amazon.jpg";
import apple from "../../assets/apple.jpg";
import google from "../../assets/google.jpg";

// const jobListings = [
//   {
//     companyLogo: amazon,
//     companyName: "Amazon",
//     role: "Software Developer",
//     jobDescription: "Write code for the big bald rich man, C++. Required second year in computer science.",
//     jobType: "Internship",
//     location: "London",
//     salary: "£24,000",
//     duration: "8 Weeks",
//   },
//   {
//     companyLogo: google,
//     companyName: "Google",
//     role: "Backend Engineer",
//     jobDescription: "Build backend APIs and services for the big bald rich man. Requires knowledge of Node.js and databases.",
//     jobType: "Full-Time",
//     location: "London",
//     salary: "£45,000",
//     duration: "Permanent",
//   },
//   {
//     companyLogo: apple,
//     companyName: "Apple",
//     role: "Data Analyst",
//     jobDescription: "Analyze customer data for Amazon. Requires SQL and Python skills.",
//     jobType: "Internship",
//     location: "Remote",
//     salary: "£30,000",
//     duration: "6 Months",
//   },
// ];

const Swiping = ( { userId }) => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matcher/recommend-jobs?uid=${userId}`);
        if (!response.ok) throw new Error(("Failed to fetch recommended jobs"));
        const data = await response.json();
        setRecommendedJobs(data.recommendedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendedJobs();
  }, [userId]);

  const handleSwipe = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 < recommendedJobs.length ? prevIndex + 1 : 0));
  };

  return (
    <div className="pt-10 bg-cover bg-center h-screen w-full grid grid-cols-10 bg-[#1b2a41]">
      <div className="col-start-1 col-span-2">
        <SwipeFilters />
      </div>
      <div className="col-start-4">
        {loading ? (
            <p>Loading job recommendations...</p>
        ) : recommendedJobs.length > 0 ? (
            <SwipeBox
                key={currentIndex}
                {...recommendedJobs[currentIndex]}
                onSwipe={handleSwipe}
            />
        ) : (
            <p>No job recommendations available.</p>
        )}
      </div>
    </div>
  );
};

export default Swiping;