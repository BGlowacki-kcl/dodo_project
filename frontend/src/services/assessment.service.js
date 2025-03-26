/**
 * Assessment Service
 * Handles code execution, testing, and assessment-related API interactions
 */
import { makeApiRequest } from './helper';

/**
 * Sends code to the execution API
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @returns {Promise<Object>} - Response with execution ID
 */
async function sendCode(code, language) {
  return await makeApiRequest('/api/assessment/send', 'POST', {
    source_code: code,
    language: language,
  });
}

/**
 * Gets execution details by ID
 * @param {string} id - Execution ID
 * @returns {Promise<Object>} - Execution details
 */
async function getExecutionDetails(id) {
  try {
    console.log("id", id);
    return await makeApiRequest(`/api/assessment/status?id=${id}`, "GET");
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Checks if code contains output statements (which are not allowed)
 * @param {string} code - Source code to check
 * @param {string} language - Programming language
 * @returns {boolean} - True if code contains output statements
 */
function containsOutputStatements(code, language) {
  const outputPatterns = {
    'python': 'print',
    'javascript': 'console.log',
    'cpp': 'cout'
  };
  
  return code.includes(outputPatterns[language]);
}

/**
 * Polls for execution results until completion or timeout
 * @param {string} id - Execution ID
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Promise<Object>} - Execution results
 */
async function pollExecutionResults(id, maxAttempts = 7, intervalMs = 2000) {
  let attempts = 0;
  let data;
  
  do {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    const response = await getExecutionDetails(id);
    data = response
    
    if (data.status !== "running") {
      break;
    }
    
    attempts++;
  } while (attempts < maxAttempts);
  
  return data;
}

/**
 * Generates test code for Python
 * @param {Array} visibleTests - Visible test cases
 * @param {Array} hiddenTests - Hidden test cases
 * @returns {string} - Generated Python test code
 */
function generatePythonTestCode(visibleTests, hiddenTests) {
  const formattedVisible = JSON.stringify(visibleTests, null, 4);
  const formattedHidden = JSON.stringify(hiddenTests, null, 4);
  
  return `
import json

testCases = json.loads('''${formattedVisible}''')
hidden_testCases = json.loads('''${formattedHidden}''')
  `;
}

/**
 * Generates test code for JavaScript
 * @param {Array} visibleTests - Visible test cases
 * @param {Array} hiddenTests - Hidden test cases
 * @returns {string} - Generated JavaScript test code
 */
function generateJavaScriptTestCode(visibleTests, hiddenTests) {
  const formattedVisible = JSON.stringify(visibleTests, null, 4);
  const formattedHidden = JSON.stringify(hiddenTests, null, 4);
  
  return `
const testCases = ${formattedVisible};
  
const hiddenTestCases = ${formattedHidden};
  `;
}

/**
 * Generates test code for C++
 * @param {Array} visibleTests - Visible test cases
 * @param {Array} hiddenTests - Hidden test cases
 * @returns {string} - Generated C++ test code
 */
function generateCppTestCode(visibleTests, hiddenTests) {
  const visibleTestsFormatted = visibleTests
    .map(tc => `{{${tc.input.join(", ")}}, ${tc.output}}`)
    .join(",\n    ");
    
  const hiddenTestsFormatted = hiddenTests
    .map(tc => `{{${tc.input.join(", ")}}, ${tc.output}}`)
    .join(",\n    ");
  
  return ` 
vector<vector<vector<int>, int>> testCases = {
    ${visibleTestsFormatted}
};
  
vector<vector<vector<int>, int>> hiddenTestCases = {
    ${hiddenTestsFormatted}
};
  `;
}

/**
 * Generates test code based on language
 * @param {Array} testCases - All test cases
 * @param {string} language - Programming language
 * @returns {string} - Generated test code
 */
function generateTestCode(testCases, language) {
  const visibleTestCases = testCases.slice(0, 5);
  const hiddenTestCases = testCases.slice(5, 10);

  const generators = {
    'python': () => generatePythonTestCode(visibleTestCases, hiddenTestCases),
    'javascript': () => generateJavaScriptTestCode(visibleTestCases, hiddenTestCases),
    'cpp': () => generateCppTestCode(visibleTestCases, hiddenTestCases)
  };
  
  return generators[language] ? generators[language]() : "";
}

/**
 * Generates Python code to execute tests
 * @returns {string} - Python code for test execution
 */
function generatePythonExecuteCode() {
  return `
for index, testCase in enumerate(testCases):
    args = testCase["input"]
    expected_output = testCase["output"][0]
    actual_output = func(*args)

    if actual_output == expected_output:
        print("Test " + str(index + 1) + ": Test PASSED")
    else:
        print("Test {}: Test FAILED - input: {}, expected output: {}, output received: {}".format(index + 1, testCase['input'], expected_output, actual_output))

for index, testCase in enumerate(hidden_testCases):
    args = testCase["input"]
    expected_output = testCase["output"][0]
    actual_output = func(*args)

    if actual_output == expected_output:
        print("Test " + str(index + 1) + ": Test PASSED HIDDEN")
    else:
        print("Test {}: Test FAILED - input: {}, expected output: {}, output received: {} HIDDEN".format(index + 1, testCase['input'], expected_output, actual_output))
  `;
}

/**
 * Generates JavaScript code to execute tests
 * @returns {string} - JavaScript code for test execution
 */
function generateJavaScriptExecuteCode() {
  return `
testCases.forEach((testCase, index) => {
    const args = testCase.input;
    const expected_output = testCase.output;
    const actual_output = func(...args);

    console.log(actual_output, expected_output[0]);
    if (JSON.stringify(actual_output) === JSON.stringify(expected_output[0])) {
        console.log(\`Test \${index + 1}: Test PASSED\`);
    } else {
        console.log(\`Test \${index + 1}: Test FAILED - input: \${JSON.stringify(testCase.input)}, expected output: \${expected_output}, output received: \${actual_output}\`);
    }
});

hiddenTestCases.forEach((testCase, index) => {
    const args = testCase.input;
    const expected_output = testCase.output;
    const actual_output = func(...args);

    if (JSON.stringify(actual_output) === JSON.stringify(expected_output[0])) {
        console.log(\`Test \${index + 1}: Test PASSED HIDDEN\`);
    } else {
        console.log(\`Test \${index + 1}: Test FAILED - input: \${JSON.stringify(testCase.input)}, expected output: \${expected_output}, output received: \${actual_output} HIDDEN\`);
    }
});
  `;
}

/**
 * Generates C++ code to execute tests
 * @param {string} funcForCpp - Function arguments for C++ tests
 * @returns {string} - C++ code for test execution
 */
function generateCppExecuteCode(funcForCpp) {
  return `
void runTests(vector<pair<vector<int>, int>> testCases, string testType) {
    for (size_t i = 0; i < testCases.size(); i++) {
        vector<int> args = testCases[i].first;
        int expected_output = testCases[i].second;
        int actual_output = func(${funcForCpp}); 

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

/**
 * Generates code to execute tests based on language
 * @param {string} language - Programming language
 * @param {string} funcForCpp - Function arguments for C++ tests
 * @returns {string} - Code for test execution
 */
function generateExecuteTestsCode(language, funcForCpp) {
  const generators = {
    'python': generatePythonExecuteCode,
    'javascript': generateJavaScriptExecuteCode,
    'cpp': () => generateCppExecuteCode(funcForCpp)
  };
  
  return generators[language] ? generators[language]() : "";
}

/**
 * Constructs the complete test code
 * @param {Array} tests - Test cases
 * @param {string} language - Programming language
 * @param {string} funcForCppTest - Function arguments for C++ tests
 * @returns {string} - Complete test code
 */
function constructCode(tests, language, funcForCppTest) {
  const testCases = generateTestCode(tests, language);
  
  if (testCases === "") {
    return { stderr: "Failed to generate test cases" };
  }
  
  const executeTestsCode = generateExecuteTestsCode(language, funcForCppTest);
  return testCases + executeTestsCode;
}

/**
 * Assessment Service object with public methods
 */
export const assessmentService = {
  /**
   * Runs code with tests
   * @param {string} code - Source code to run
   * @param {string} language - Programming language
   * @param {Array} tests - Test cases
   * @param {string} funcForCppTest - Function arguments for C++ tests
   * @returns {Promise<Object>} - Execution results
   */
  async runCode(code, language, tests, funcForCppTest) {
    if (containsOutputStatements(code, language)) {
      return { stderr: "You cannot use output statement in your code" };
    }
    
    const completeCode = code + constructCode(tests, language, funcForCppTest);
    const codeSendResponse = await sendCode(completeCode, language);
    
    if (!codeSendResponse || !codeSendResponse.id) {
      return { stderr: "Failed to submit code for execution" };
    }
    
    const id = codeSendResponse.id;
    return await pollExecutionResults(id);
  },

  /**
   * Gets a specific task
   * @param {string} appId - Application ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Task details
   */
  async getTask(appId, taskId) {
    return await makeApiRequest(`/api/assessment/task?appId=${appId}&taskId=${taskId}`, "GET");
  },

  /**
   * Gets task IDs for an application
   * @param {string} appId - Application ID
   * @returns {Promise<Object>} - Task IDs
   */
  async getTasksId(appId) {
    return await makeApiRequest(`/api/assessment/tasksid?appId=${appId}`, "GET");
  },

  /**
   * Gets all tasks
   * @returns {Promise<Object>} - All tasks
   */
  async getAllTasks() {
    return await makeApiRequest('/api/assessment/alltasks', "GET");
  },

  /**
   * Submits assessment solution
   * @param {string} appId - Application ID
   * @param {boolean} testsPassed - Whether tests passed
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Submission result
   */
  async submit(appId, testsPassed, code, language, taskId) {
    try {
      const data = await makeApiRequest('/api/assessment/submit', 'POST', {
        appId,
        testsPassed,
        code,
        language,
        taskId
      });
      
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message || "Server error" };
    }
  }
};