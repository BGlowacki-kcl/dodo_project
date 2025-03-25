// filepath: c:\Users\Saad\Documents\Year 2\SEG\CW\dodo_project\frontend\src\components\PostDetailsContent.jsx
import React from "react";

const PostContent = ({ jobId }) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Post Details for Job ID: {jobId}</h3>
      <p>Details about the job post will go here.</p>
    </div>
  );
};

export default PostContent;