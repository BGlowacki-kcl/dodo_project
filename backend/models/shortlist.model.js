import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "JobSeeker", required: true },
        jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    },
    { timestamps: true }
);

export default mongoose.model("Shortlist", shortlistSchema);
