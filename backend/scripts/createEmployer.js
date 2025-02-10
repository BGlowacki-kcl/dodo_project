// THIS IS A TEST SCRIPT SO I CAN MAKE AN EMPLOYER TO TEST FRONTEND-BACKEND CONNECT
import mongoose from 'mongoose';
import { Employer } from "../models/user/Employer.model.js"; 
import dotenv from 'dotenv';


dotenv.config(); 

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');


    const newEmployer = await Employer.create({
      uid: 'test-employer-01',
      email: 'testemployer@example.com',
      role: 'employer',
      name: 'John Employer',
      companyName: 'Test Company Inc.',
      companyWebsite: 'https://testcompany.com',
      companyDescription: 'John Test Company Inc.',
    });

    console.log('New employer created:', newEmployer);
  } catch (error) {
    console.error('Error creating employer:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
