import mongoose from "mongoose";

/**
 * Shortlist model schema
 * Represents a collection of jobs saved by a job seeker
 * Allows users to bookmark and track jobs they're interested in
 * @type {mongoose.Schema}
 */
const shortlistSchema = new mongoose.Schema(
    {
        /**
         * Reference to the job seeker who created the shortlist
         * Links to the JobSeeker collection
         * @type {String}
         */
        user: { type: String, ref: "JobSeeker", required: true },
        
        /**
         * Array of job references saved by the user
         * Links to the Job collection
         * @type {Array<mongoose.Schema.Types.ObjectId>}
         */
        jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    },
    { timestamps: true }
);

export default mongoose.model("Shortlist", shortlistSchema);
