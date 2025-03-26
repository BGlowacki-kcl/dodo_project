import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SwipeBox from "../../components/SwipeBox";
import { getRecommendedJobs } from "../../services/matcher.service";
import { addJobToShortlist, getShortlist } from "../../services/shortlist.service";

const Swiping = () => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [interactedJobIds, setInteractedJobIds] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const shortlistResponse = await getShortlist();
          const shortlistedJobIds = shortlistResponse.jobs.map(job => job._id);
          setInteractedJobIds(prevIds => [...prevIds, ...shortlistedJobIds]);

          const jobs = await getRecommendedJobs();
          const filteredJobs = jobs.filter(job => !shortlistedJobIds.includes(job._id));
          setRecommendedJobs(filteredJobs);
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleShortlist = async (jobId) => {
    try {
      await addJobToShortlist(jobId);
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
      <div className="min-h-screen w-full bg-[#1b2a41] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {loading ? (
              <div className="text-white text-center py-8">
                <p className="text-xl">Loading job recommendations...</p>
              </div>
          ) : recommendedJobs.length > 0 ? (
              <SwipeBox
                  key={currentIndex}
                  {...recommendedJobs[currentIndex]}
                  onSwipe={handleSwipe}
                  onShortlist={handleShortlist}
                  onSkip={() => handleSkip(recommendedJobs[currentIndex]._id)}
                  jobId={recommendedJobs[currentIndex]._id}
              />
          ) : (
              <div className="text-white text-center py-8">
                <p className="text-xl">No job recommendations available</p>
                <p className="text-gray-400 mt-2">Check back later or adjust your preferences</p>
              </div>
          )}
        </div>
      </div>
  );
};

export default Swiping;