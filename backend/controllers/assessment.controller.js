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
            console.log("AAAAAAAAAAAA");
            const { id } = req.query;
            const statusResponse = await fetch(`https://paiza-io.p.rapidapi.com/runners/get_details?id=${id}`, {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "paiza-io.p.rapidapi.com",
                    "x-rapidapi-key": process.env.PAIZA_API_KEY,
                }
              })
        
              const statusData = await statusResponse.json();
              console.log(statusData);
        
              return res.status(200).json({ data: statusData });
          } catch (err) {
              console.error(err);
              return res.status(500).json({ message: "Internal server error", error: err.message });
          }
    }
}

export default assessmentController;