import mongoose from "mongoose";
import User from "./user.model";

const Employer = User.discriminator(
    "employer",
    new mongoose.Schema({
        companyName: String,
        companyWebsite: String,
        companyDescription: String,
        postedJobs: [{
                type: Schema.Types.ObjectId,
                ref: 'Job'
        }]
    })
);

module.exports = Employer;