import mongoose from "mongoose";

const { Schema } = mongoose;

const jobApplicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  applicant: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: ["applied", "in review", "shortlisted", "rejected", "hired"],
    default: "applied",
  },

  coverLetter: {
    type: String,
    trim: true,
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model("Application", jobApplicationSchema);
export default Application;


