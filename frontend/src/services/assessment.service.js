
export const assessmentService = {
    async runCode(code, language){
        const testCases = `
testCases = [
    {
        "input": [1, 2],
        "output": 3,
    },
    {
        "input": [3, 4],
        "output": 7,
    },
    {
        "input": [5, 6],
        "output": 11,
    },
]
`;
        const addToCode = `
for index, testCase in enumerate(testCases):
    args = testCase["input"]
    expected_output = testCase["output"]
    actual_output = func(*args)

    if actual_output == expected_output:
        print("Test " + str(index + 1) + ": Test PASSED")
    else:
        print("Test {}: Test FAILED - input: {}, expected output: {}, output received: {}".format(index + 1, testCase['input'], expected_output, actual_output))
`;
        code += testCases + addToCode;

        console.log("Code: ", code, "...");
        const response = await fetch('/api/code', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                //'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                source_code: code,
                language: language,
            })
        });
        if (!response.ok) {
            throw new Error("Failed to run code");
        }
        const data = await response.json();
        console.log("Code: ",data);
        return data;
    }
}  