import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SwipeBox from "../../components/SwipeBox";
import { getRecommendedJobs } from "../../services/matcher.service";
import { addJobToShortlist } from "../../services/shortlist.service"; // import the service

const Swiping = () => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const jobs = await getRecommendedJobs();
          setRecommendedJobs(jobs);
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("User not authenticated.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handler for when a job is short-listed
  const handleShortlist = async (jobId) => {
    try {
      // If your addJobToShortlist expects only jobId, call it as below:
      await addJobToShortlist(jobId);
      console.log("Job added to shortlist:", jobId);
    } catch (error) {
      console.error("Error adding job to shortlist:", error);
    }
  };

  const handleSwipe = () => {
    setCurrentIndex((prevIndex) =>
        prevIndex + 1 < recommendedJobs.length ? prevIndex + 1 : 0
    );
  };

  return (
      <div className="pt-10 bg-cover bg-center h-screen w-full grid grid-cols-10 bg-[#1b2a41]">
        <div className="col-start-4">
          {loading ? (
              <p>Loading job recommendations...</p>
          ) : recommendedJobs.length > 0 ? (
              <SwipeBox
                  key={currentIndex}
                  {...recommendedJobs[currentIndex]}
                  onSwipe={handleSwipe}
                  onShortlist={handleShortlist} // pass the shortlist handler
                  jobId={recommendedJobs[currentIndex]._id} // assuming each job object has _id property
              />
          ) : (
              <p>No job recommendations available.</p>
          )}
        </div>
      </div>
  );
};

export default Swiping;
