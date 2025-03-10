export default async function runCode(req, res) {
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
      const requestId = data.id;

      const statusResponse = await fetch(`https://paiza-io.p.rapidapi.com/runners/get_details?id=${requestId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
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
}

export async function getRunStatus(req, res) {

}

// const JUDGE0_BARE_URL = "https://judge0-production-7dcf.up.railway.app";
// const JUDGE0_API_URL = `${JUDGE0_BARE_URL}/submissions`;
// // const JUDGE0_HEADERS = {
// //   "X-RapidAPI-Key": process.env.RAILWAY_TOKEN, // Add your API key to .env
// //   "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
// // };

// export default async function code(req, res) {
//     const { code, language } = req.body;
//     console.log("code: ", code, ", language: ", language);
//     const languageMap = {
//         javascript: 63,
//         python: 71,
//         cpp: 54,
//       };
//       try {
//         // Submit code to Judge0 using fetch()
//         const response = await fetch(JUDGE0_API_URL, {
//           method: "POST",
//           headers: {
//             // ...JUDGE0_HEADERS,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             source_code: code,
//             language_id: languageMap[language],
//           }),
//         });
    
//         const responseData = await response.json();
//         console.log("responseData: ", responseData);
//         const { token } = responseData;
    
//         // Wait for execution result
//         setTimeout(async () => {
//           const resultResponse = await fetch(`${JUDGE0_API_URL}/${token}`, {
//             method: "GET",
//             // headers: JUDGE0_HEADERS,
//           });
    
//           const resultData = await resultResponse.json();
//           res.json({ output: resultData.stdout || resultData.stderr });
//         }, 3000);
//       } catch (error) {
//         res.status(500).json({ error: "Execution failed" });
//       }
// }