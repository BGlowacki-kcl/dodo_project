import React from "react";
import { useParams } from "react-router-dom";

const PostDetails = () => {
  const { jobId } = useParams();

  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold text-left">Post Details</h1>
        <p className="text-gray-600 mt-4">Job ID: {jobId}</p>
      </div>
    </div>
  );
};

export default PostDetails;
