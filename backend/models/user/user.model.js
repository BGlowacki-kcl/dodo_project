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

    //shows its been completed, can link this straight to a code submission instead or remove this bit (kind of makes a many-many relationship)?? code submission does link to a user though so can find what a user has done through that
    // completedAssessments: [
    //     {
    //       type: Schema.Types.ObjectId,
    //       ref: 'CodeAssessment'
    //     }
    //   ],

},
{ discriminatorKey: "role", collection: "users" }
);


const User = mongoose.model("User", userSchema);
export default User;
