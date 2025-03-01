import React, { useState } from 'react';
import Editor from "@monaco-editor/react";
import { assessmentService } from '../../services/assessment.service';

const CodeAss = () => {
  const [code, setCode] = useState(`# Write a function that takes number x and y, then returns the sum of x and y

def func(x, y):
  # Write your code here
  `);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [testsPassed, setTestsPassed] = useState(0);
  
  const runCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    const response = await assessmentService.runCode(code, language);
    setLoading(false);

    if(response.data.stderr != ""){
      setError(response.data.stderr);
      return;
    }

    const lines = response.data.stdout.split("\n");
    let newTestsPassed = 0;

    const filteredLines = lines.filter((line) => {
      if (line.includes("PASSED")) {
        newTestsPassed++;
      }
      if (line.includes("HIDDEN")) {
        return false;
      }
      return true;
    });

    setTestsPassed(newTestsPassed);
    setOutput(filteredLines.join("\n"));
  }

  const handleSubmit = async () => {
    
  }

  return (
    <div className='bg-[#1B2A41] h-screen'>
      <div className='flex flex-row items-center justify-center'>
        <div className='flex flex-col items-center justify-center w-full p-4 space-y-20'>
          <select
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border-white border bg-gray-900 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
          </select>

          <button onClick={runCode} className='text-black bg-slate-300 border-grey-400 border rounded-full p-5' >Run Code</button>

        </div>

        <div className="flex justify-center items-center w-full p-4">
          <div className="w-[1000px] h-[300px] bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
            <Editor
              height="100%"
              width="100%"
              language={language}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 10 },
                cursorBlinking: "smooth",
              }}
            />
          </div>
        </div>
      </div>
      <div className='relative p-4 m-10 bg-slate-400 border-gray-600 border-2 rounded-md h-1/3'>
        { loading && 
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 animate-ping"></div>
          </div>
        }
         {output && output.split("\n").map((line, index) => (
          <pre
            key={index}
            className={`p-1 ${
              line.includes("PASSED") ? "text-green-600 font-semibold" :
              line.includes("FAILED") ? "text-red-600 font-semibold" :
              "text-black"
            }`}
          >
            {line}
          </pre>
        ))}
        { error &&
          <pre className='text-red-700 width-1/2'>{error}</pre>
        }
        <p className='text-white p-3 rounded-md border border-grey-400 bg-black absolute right-5 top-5'>Tests Passed: {testsPassed} / 10</p>
        <button onClick={handleSubmit} className='absolute bottom-3 right-3 rounded-full p-3 bg-white' >Submit</button>
      </div>
    </div>
  )
}

export default CodeAss