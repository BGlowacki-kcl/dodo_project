import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SwipeBox from "../../components/SwipeBox";
import { getRecommendedJobs } from "../../services/matcher.service";
import { addJobToShortlist } from "../../services/shortlist.service";

const Swiping = () => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [interactedJobIds, setInteractedJobIds] = useState([]); // Track interacted jobs

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const jobs = await getRecommendedJobs();
          // Filter out jobs that have been interacted with
          const filteredJobs = jobs.filter(job => !interactedJobIds.includes(job._id));
          setRecommendedJobs(filteredJobs);
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
  }, [interactedJobIds]); // Re-fetch jobs when interactedJobIds changes

  const handleShortlist = async (jobId) => {
    try {
      await addJobToShortlist(jobId);
      console.log("Job added to shortlist:", jobId);
      setInteractedJobIds(prevIds => [...prevIds, jobId]);
    } catch (error) {
      console.error("Error adding job to shortlist:", error);
    }
  };

  const handleSkip = (jobId) => {
    setInteractedJobIds(prevIds => [...prevIds, jobId]);
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
                  onShortlist={handleShortlist}
                  onSkip={() => handleSkip(recommendedJobs[currentIndex]._id)} // Pass the skip handler
                  jobId={recommendedJobs[currentIndex]._id}
              />
          ) : (
              <p>No job recommendations available.</p>
          )}
        </div>
      </div>
  );
};

export default Swiping;