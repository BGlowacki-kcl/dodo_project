import mongoose from 'mongoose';
const { Schema } = mongoose;

const jobApplicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['applying', 'applied', 'in review', 'shortlisted', 'rejected', 'hired'],
    default: 'applying'
  },

  // if we want a coverletter or anything else linked to the job application
  coverLetter: String,

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export const Application = mongoose.model('Application', jobApplicationSchema);