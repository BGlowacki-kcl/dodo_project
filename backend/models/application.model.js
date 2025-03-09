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
    enum: ['applying', 'applied', 'in review', 'shortlisted', 'code challenge', 'rejected', 'accepted'],
    default: 'applying'
  },

  // if we want a coverletter or anything else linked to the job application
  coverLetter: String,

  submittedAt: {
    type: Date,
    default: Date.now
  },

  assessmets: [{
    type: Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
});

export default mongoose.model('Application', jobApplicationSchema);