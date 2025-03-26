import mongoose from "mongoose";

export const mockApplications = [
    {
        _id: new mongoose.Types.ObjectId(),
        job: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c85"),
        applicant: new mongoose.Types.ObjectId("60d21b4967d0d8992e610c86"),
        status: "Applied",
        coverLetter: "I am highly interested in this role and believe I would be a great addition to your team."
    },
    {
        _id: new mongoose.Types.ObjectId(),
        job: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c85"),
        applicant: new mongoose.Types.ObjectId("60d21b4967d0d8992e610c86"),
        status: "Applying",
        coverLetter: "I am highly interested in this role and believe I would be a great addition to your team."
    }
];