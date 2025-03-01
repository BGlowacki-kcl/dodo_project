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
  
  const runCode = async () => {
    const response = await assessmentService.runCode(code, language);
    setOutput(response.data.stdout);
  }

  return (
    <div>
      <select onChange={(e) => setLanguage(e.target.value)}>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
      </select>

      <Editor height="300px" language={language} value={code} onChange={setCode} />

      <button onClick={runCode}>Run Code</button>
      <pre>{output}</pre>
    </div>
  )
}

export default CodeAss