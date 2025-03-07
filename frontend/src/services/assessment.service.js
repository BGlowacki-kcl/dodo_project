export const assessmentService = {
    async runCode(code, language){
        if(code.includes("print") && language === "python" || code.includes("console.log") && language === "javascript" || code.includes("cout") && language === "cpp") {
            return {data: {stderr: "You cannot use output statement in your code"}};
        }
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
        const executeTestsCode = generateExecuteTestsCode(language);
        code += testCases + executeTestsCode;

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
        if(data.data.status === "running") {
            const executionDetails = await getExecutionDetails(data.data.id);
            return { data : executionDetails};
        }
        return data;
    },

    async getTask(appId) {
        const response = await fetch("/api/code/")
    },
    async getTests() {

    }
}  

async function getExecutionDetails(id) {
    const url = `https://paiza-io.p.rapidapi.com/runners/get_details?id=${id}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'paiza-io.p.rapidapi.com',
                'x-rapidapi-key': '4681e248b1msh30ecf173f9bcb36p1b67aejsnb530c30fe769'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch execution details");
        }

        const data = await response.json();
        console.log("Execution Details: ", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        return { error: error.message };
    }
}

function generateExecuteTestsCode(language) {
    if(language === "python") {
        return `
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
    }

    if (language === "javascript") {
        return `
testCases.forEach((testCase, index) => {
    const args = testCase.input;
    const expected_output = testCase.output;
    const actual_output = func(...args);

    if (actual_output === expected_output) {
        console.log(\`Test \${index + 1}: Test PASSED\`);
    } else {
        console.log(\`Test \${index + 1}: Test FAILED - input: \${JSON.stringify(testCase.input)}, expected output: \${expected_output}, output received: \${actual_output}\`);
    }
});

hiddenTestCases.forEach((testCase, index) => {
    const args = testCase.input;
    const expected_output = testCase.output;
    const actual_output = func(...args);

    if (actual_output === expected_output) {
        console.log(\`Test \${index + 1}: Test PASSED HIDDEN\`);
    } else {
        console.log(\`Test \${index + 1}: Test FAILED - input: \${JSON.stringify(testCase.input)}, expected output: \${expected_output}, output received: \${actual_output} HIDDEN\`);
    }
});
        `;
    }

    if (language === "cpp") {
        return `

void runTests(vector<pair<vector<int>, int>> testCases, string testType) {
    for (size_t i = 0; i < testCases.size(); i++) {
        vector<int> args = testCases[i].first;
        int expected_output = testCases[i].second;
        int actual_output = func(args[0], args[1]);  // Assuming 2 inputs for simplicity

        if (actual_output == expected_output) {
            cout << "Test " << i + 1 << ": Test PASSED " << testType << endl;
        } else {
            cout << "Test " << i + 1 << ": Test FAILED - input: [" << args[0] << ", " << args[1] << "], expected output: " << expected_output << ", output received: " << actual_output << " " << testType << endl;
        }
    }
}

int main() {
    runTests(testCases, "");
    runTests(hiddenTestCases, "HIDDEN");
    return 0;
}
        `;
    }

    return "";
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
vector<pair<vector<int>, int>> testCases = {
    ${visibleTestCases.map(tc => `{{${tc.input.join(", ")}}, ${tc.output}}`).join(",\n    ")}
};
  
vector<pair<vector<int>, int>> hiddenTestCases = {
    ${hiddenTestCases.map(tc => `{{${tc.input.join(", ")}}, ${tc.output}}`).join(",\n    ")}
};
      `;
    }
  
    return "";
  }