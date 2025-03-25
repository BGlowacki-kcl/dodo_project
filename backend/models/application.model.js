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
    enum: ['Applying', 'Applied', 'In Review', 'Shortlisted', 'Code Challenge', 'Rejected', 'Accepted'],
    default: 'Applying'
  },

  coverLetter: String,

  submittedAt: {
    type: Date,
    default: Date.now
  },

  answers: [
    {
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      answerText: {
        type: String,
        required: true
      }
    }
  ],

  finishAssessmentDate: {
    type: Date,
    required: false
  }
});

export default mongoose.model('Application', jobApplicationSchema);