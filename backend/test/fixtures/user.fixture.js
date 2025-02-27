import mongoose from "mongoose";

export const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    uid: "mock-firebase-uid",
    email: "test@example.com",
    role: "jobSeeker",
    name: "Test User"
};