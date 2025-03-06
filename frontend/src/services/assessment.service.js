import { checkTokenExpiration } from './auth.service';

export const assessmentService = {
    async runCode(code, language){
        const response = await fetch('/api/code', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                //'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                code: code,
                language: language,
            })
        });
        const responseJson = await response.json();
        checkTokenExpiration(responseJson);
        if (!response.ok) {
            throw new Error("Failed to run code");
        }
        return responseJson;
    }
}  