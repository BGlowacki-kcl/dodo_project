import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Job Application model schema
 * Represents a job application submitted by a user
 * Tracks application status, responses, and assessment results
 * @type {mongoose.Schema}
 */
const jobApplicationSchema = new Schema({
  /**
   * Reference to the job being applied for
   * Links to the Job collection
   * @type {mongoose.Schema.Types.ObjectId}
   */
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  /**
   * Reference to the user who submitted the application
   * Links to the User collection
   * @type {mongoose.Schema.Types.ObjectId}
   */
  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /**
   * Current status of the application in the hiring process
   * Tracks application progress from submission to final decision
   * @type {String}
   */
  status: {
    type: String,
    enum: ['Applying', 'Applied', 'In Review', 'Shortlisted', 'Code Challenge', 'Rejected', 'Accepted'],
    default: 'Applying'
  },

  /**
   * Applicant's cover letter text
   * @type {String}
   */
  coverLetter: String,

  /**
   * Timestamp when application was submitted
   * Automatically set to current date if not provided
   * @type {Date}
   */
  submittedAt: {
    type: Date,
    default: Date.now
  },

  /**
   * Array of answers to application questions
   * Contains question references and applicant's responses
   * @type {Array<Object>}
   */
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

  /**
   * Date when the assessment portion was completed
   * Optional field used only when assessment is part of application
   * @type {Date}
   */
  finishAssessmentDate: {
    type: Date,
    required: false
  }
});

export default mongoose.model('Application', jobApplicationSchema);