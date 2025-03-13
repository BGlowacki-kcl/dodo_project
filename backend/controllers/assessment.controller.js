import CodeAssessment from "../models/codeAssessment";
import CodeSubmission from "../models/codeSubmission";

const assessmentController = {
    async sendCode(req, res) {
        const { source_code, language } = req.body;
  
        if (!source_code || !language) {
            return res.status(400).json({ message: "source_code and language are required" });
        }
        
        try {
            const response = await fetch("https://paiza-io.p.rapidapi.com/runners/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-host": "paiza-io.p.rapidapi.com",
                    "x-rapidapi-key": process.env.PAIZA_API_KEY,
                },
                body: JSON.stringify({ source_code, language })
            });

            const data = await response.json();
            res.status(200).json({ message: "Sent code successfully", data: data });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    },

    async getStatus(req, res) {
        try {
            const { id } = req.query;
            const statusResponse = await fetch(`https://paiza-io.p.rapidapi.com/runners/get_details?id=${id}`, {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "paiza-io.p.rapidapi.com",
                    "x-rapidapi-key": process.env.PAIZA_API_KEY,
                }
              })
        
              const statusData = await statusResponse.json();
              return res.status(200).json({ data: statusData });
          } catch (err) {
              console.error(err);
              return res.status(500).json({ message: "Internal server error", error: err.message });
          }
    },

    async getTask(req, res) {
        try {
            const { id } = req.query;
            if(!id){
                return res.status(400).json({ message: "No id provided"});
            }
            const assessment = CodeAssessment.findOne({ _id: id });
            if(!assessment){
                return res.status(401).json({ message: "Assessment not found"});
            }
            return res.status(200).json({ message: "Successfully retrived aassessment", data: assessment});
        } catch (err) {
            return res.status(500).json({ message: "Error: "+err.message });
        }
    },
    
    async submit(req, res){

    },

    async createAss(req, res){
        const assessment = {
            title,
            description,
            difficulty,
            testCases,
            funcForCpp,
            funcForCppTest
        } = req.body;
        const newAssessment = new CodeAssessment({
            title,
            description,
            difficulty,
            testCases,
            funcForCpp,
            funcForCppTest
        })
        const assessmentAdded = await assessment.save();
        return res.status(200).json({ message: "assessment added successfully" });
    }
}

export default assessmentController;