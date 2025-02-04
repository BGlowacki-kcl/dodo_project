import mongoose from "mongoose";
import { User } from "./user.model.js";
const { Schema } = mongoose;

const employer = User.discriminator(
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

export const Employer = employer;