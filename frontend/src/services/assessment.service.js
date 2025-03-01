
export const assessmentService = {
    async runCode(code, language){
        if(code.includes("print")){
            return {data: {stderr: "You cannot use print statement in your code"}};
        }
//         const testCases = `
// testCases = [
//     {
//         "input": [1, 2],
//         "output": 3,
//     },
//     {
//         "input": [3, 4],
//         "output": 7,
//     },
//     {
//         "input": [5, 6],
//         "output": 11,
//     },
//     {
//         "input": [10, 6],
//         "output": 16,
//     },
//     {
//         "input": [11, 6],
//         "output": 17,
//     },
// ]
// hidden_testCases = [
//     {
//         "input": [0, 2],
//         "output": 2,
//     },
//     {
//         "input": [31, 4],
//         "output": 35,
//     },
//     {
//         "input": [51, 6],
//         "output": 57,
//     },
//     {
//         "input": [15, 16],
//         "output": 31,
//     },
//     {
//         "input": [5, 61],
//         "output": 66,
//     },
// ]
// `;
        const tests = [
            {
                input: [1, 2],
                output: 3,
            },
            {
                input: [3, 4],
                output: 7,
            },
            {
                input: [5, 6],
                output: 11,
            },
            {
                input: [10, 6],
                output: 16,
            },
            {
                input: [11, 6],
                output: 17,
            },
            {
                input: [11, 6],
                output: 17,
            },
            {
                input: [11, 6],
                output: 17,
            },
            {
                input: [11, 6],
                output: 17,
            },
            {
                input: [11, 6],
                output: 17,
            },
            {
                input: [11, 6],
                output: 17,
            },
        ]
        const testCases = generateTestCode(tests, language)
        if(testCases === "") {
            return {data: {stderr: "Failed to generate test cases"}};
        }
        const addToCode = `
for index, testCase in enumerate(testCases):
    args = testCase["input"]
    expected_output = testCase["output"]
    actual_output = func(*args)

    if actual_output == expected_output:
        print("Test " + str(index + 1) + ": Test PASSED")
    else:
        print("Test {}: Test FAILED - input: {}, expected output: {}, output received: {}".format(index + 1, testCase['input'], expected_output, actual_output))

for index, testCase in enumerate(hidden_testCases):
    args = testCase["input"]
    expected_output = testCase["output"]
    actual_output = func(*args)

    if actual_output == expected_output:
        print("Test " + str(index + 1) + ": Test PASSED HIDDEN")
    else:
        print("Test {}: Test FAILED - input: {}, expected output: {}, output received: {} HIDDEN".format(index + 1, testCase['input'], expected_output, actual_output))
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



function generateTestCode(testCases, language) {
    const visibleTestCases = testCases.slice(0, 5);
    const hiddenTestCases = testCases.slice(5, 10);

    let formattedTestCases = JSON.stringify(visibleTestCases, null, 4);
    let formattedHiddenTestCases = JSON.stringify(hiddenTestCases, null, 4);
  
    if (language === "python") {
  
      return `
import json

testCases = json.loads('''${formattedTestCases}''')
hidden_testCases = json.loads('''${formattedHiddenTestCases}''')
      `;
    }
  
    if (language === "javascript") {
      formattedTestCases = JSON.stringify(visibleTestCases, null, 4);
      formattedHiddenTestCases = JSON.stringify(hiddenTestCases, null, 4);
  
      return `
const testCases = ${formattedTestCases};
  
const hiddenTestCases = ${formattedHiddenTestCases};
      `;
    }
  
    if (language === "cpp") {
      return `
#include <vector>
#include <utility>
  
std::vector<std::pair<std::vector<int>, int>> testCases = {
    ${visibleTestCases.map(tc => `{{${tc.input.join(", ")}}, ${tc.output}}`).join(",\n    ")}
};
  
std::vector<std::pair<std::vector<int>, int>> hiddenTestCases = {
    ${hiddenTestCases.map(tc => `{{${tc.input.join(", ")}}, ${tc.output}}`).join(",\n    ")}
};
      `;
    }
  
    return "";
  }