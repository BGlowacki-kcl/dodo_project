import OpenAI from "openai";

const systemPrompt = `Start arguing with the user about the current political situation of the world.`;

export default async function chat(req, res) {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    })
    const { query } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
        })
        return res.status(200).json({ data: completion });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error "});
    }
    
}