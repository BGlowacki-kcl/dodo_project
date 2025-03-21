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

  coverLetter: String,

  submittedAt: {
    type: Date,
    default: Date.now
  },

  assessments: [{
    type: Schema.Types.ObjectId,
    ref: 'Assessment'
  }],

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