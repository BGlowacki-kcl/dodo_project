import React, { useState } from "react";
import SwipeBox from "../../components/SwipeBox";
import amazon from "../../assets/amazon.jpg";


//TO DO: filler data, change this to read from the models
const jobListings = [
  {
    companyLogo: amazon,
    companyName: "Amazon",
    role: "Software Developer",
    jobDescription: "Write code for the big bald rich man, C++. Required second year in computer science.",
    jobType: "Internship",
    location: "London",
    salary: "£24,000",
    duration: "8 Weeks",
  },
  {
    companyLogo: amazon,
    companyName: "Amazon",
    role: "Backend Engineer",
    jobDescription: "Build backend APIs and services for the big bald rich man. Requires knowledge of Node.js and databases.",
    jobType: "Full-Time",
    location: "London",
    salary: "£45,000",
    duration: "Permanent",
  },
  {
    companyLogo: amazon,
    companyName: "Amazon",
    role: "Data Analyst",
    jobDescription: "Analyze customer data for Amazon. Requires SQL and Python skills.",
    jobType: "Internship",
    location: "Remote",
    salary: "£30,000",
    duration: "6 Months",
  },
];

const Swiping = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleSwipe = (direction) => {
    setSwiping(true);

    setTimeout(() => {
      setSwiping(false);
      setCurrentIndex((prev) => (prev + 1 < jobListings.length ? prev + 1 : 0)); // Loop back to first job
    }, 500);
  };

  return (
    <div className="pt-10 bg-cover bg-center h-screen w-full flex flex-col items-center">
      {currentIndex < jobListings.length && (
        <SwipeBox
          {...jobListings[currentIndex]}
          onSkip={() => handleSwipe("left")}
          onShortlist={() => handleSwipe("right")}
          swiping={swiping}
        />
      )}
    </div>
  );
};

export default Swiping;
