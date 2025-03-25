import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({

    uid: {
        type: String,
        required: true,
        unique: true
    },

    // example of the user schema, can add a field for code assesments completed
    email: {
        type: String,
        required: true,
        unique: true
    },

    //any other fields below could be made required
    role: {
        type: String,
        enum: ['jobSeeker', 'employer', 'admin'],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now 
    },

    isActive: {
        type: Boolean,
        default: true
    },

    name: {
        type: String
    },

    phoneNumber: {
        type: String
    },

    location: {
        type: String
    },

},
{ discriminatorKey: "role", collection: "users" }
);

export default mongoose.model("User", userSchema);
