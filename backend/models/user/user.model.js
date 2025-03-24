import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Base User model schema
 * Serves as parent model for JobSeeker and Employer models
 * Contains common user fields and authentication information
 * @type {mongoose.Schema}
 */
const userSchema = new Schema({
    /**
     * Unique identifier for the user
     * Used for authentication and reference
     * @type {String}
     */
    uid: {
        type: String,
        required: true,
        unique: true
    },

    /**
     * User's email address
     * Used for communication and login identification
     * @type {String}
     */
    email: {
        type: String,
        required: true,
        unique: true
    },

    /**
     * User's role in the system
     * Determines permissions and available features
     * @type {String}
     */
    role: {
        type: String,
        enum: ['jobSeeker', 'employer', 'admin'],
        required: true
    },

    /**
     * Date when the user account was created
     * Automatically set to current date if not provided
     * @type {Date}
     */
    createdAt: {
        type: Date,
        default: Date.now 
    },

    /**
     * Flag indicating if user account is active
     * Used for account suspension or deletion
     * @type {Boolean}
     */
    isActive: {
        type: Boolean,
        default: true
    },

    /**
     * User's full name
     * @type {String}
     */
    name: {
        type: String
    },

    /**
     * User's phone number
     * @type {String}
     */
    phoneNumber: {
        type: String
    },

    /**
     * User's geographical location
     * @type {String}
     */
    location: {
        type: String
    },
},
{ discriminatorKey: "role", collection: "users" }
);

export default mongoose.model("User", userSchema);
