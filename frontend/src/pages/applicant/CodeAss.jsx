import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from "@monaco-editor/react";

import { auth } from '../../firebase.js';
import { assessmentService } from '../../services/assessment.service';
import { useNotification } from '../../context/notification.context';
import AssessmentStatus from '../../components/AssessmentStatus';

const CodeAss = () => {
  const [code, setCode] = useState(``);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [testsPassed, setTestsPassed] = useState(0);
  const [tasksId, setTasksId] = useState([{
    id: "",
    status: "",
    title: ""
  }]);
  const [task, setTask] = useState({
    _id: "",
    description: "",
    tests: null,
    funcForCpp: "",
    funcForCppTest:"",
    inputForPythonJS:"",
    code: ""
  });
  const { appId } = useParams();
  const navigate = useNavigate();
  const showNotification = useNotification();

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          
          sessionStorage.setItem('token', newToken);
          
          console.log('Firebase token refreshed successfully');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        showNotification('Session error', 'error');
      }
    };

    refreshToken();
    const tokenRefreshInterval = setInterval(refreshToken, 20 * 60 * 1000);

    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [navigate, showNotification]);


  const fetchAndSetFirstTask = async () => {
    try {
      const taskResponse = await assessmentService.getTasksId(appId);
      console.log("Task Ids: ", taskResponse.data);
      
      if (taskResponse.data.length === 0) return; 
      setTasksId(taskResponse.data);
      
      const firstTaskResponse = await assessmentService.getTask(appId, taskResponse.data[0].id);
      console.log("First task: ", firstTaskResponse);
      
      setTask(firstTaskResponse.data.assessment);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchAndSetFirstTask();
  }, [appId]);
  
  useEffect(() => {
    console.log("Changing to task: ", task);
    setCodeForLanguage(language, task);
  }, [task, language]);

  const handleTaskChange = async (taskId) => {
    // TODO: get previous submission code
    const response = await assessmentService.getTask(appId, taskId);
    console.log("Task retrived: ", response);
    setTask(response.data.assessment);
    setTestsPassed(0);
    setOutput("");
    showNotification("Task Changed", "success");
  }

  const setCodeForLanguage = (lang, task) => {
    let defText = "";
    if (lang === "python") {
      defText = `# ${task.description}

def func(${task.inputForPythonJS}):
  # Write your code here`;
    } else if (lang === "javascript") {
      defText = `// ${task.description}

function func(${task.inputForPythonJS}) {
  // Write your code here

}`;
    } else if (lang === "cpp") {
      defText = `// ${task.description}

#include <vector>
#include <iostream>
#include <utility>
#include <string>

using namespace std;

int func(${task.funcForCpp}) {
  // Write your code here

  return 0;
}`;
    }
    setCode(defText);
  }

  const handleLanguageChange = (e) => {
    const userConfirmed = window.confirm("The current progress will not be saved. Do you wish to proceed?");
    setTestsPassed(0);
    setOutput("");
    if(!userConfirmed) {
      e.target.value = language;
      return;
    }
    setLanguage(e.target.value);
  }

  const submitAll = async () => {
    // TODO: Change status of application to in review
    showNotification("Tank you for taking the assessment", "success");
    navigate("/");
  }
  
  const runCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    console.log("TASKLLLLL: ", task);
    const response = await assessmentService.runCode(code, language, task.testCases, task.funcForCppTest);
    console.log("Res: ", response);
    setLoading(false);

    if(response.data.stderr && response.data.stderr != ""){
      setError(response.data.stderr);
      return;
    }
    console.log("Build_err: ",response.data.build_stderr);
    if(response.data.build_stderr && response.data.build_stderr != ""){
      setError(response.data.build_stderr);
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
    console.log("SUBMIT");
    const response = await assessmentService.submit(appId, testsPassed, code, language, task._id);
    const notificationStatus = response.success ? "success" : "danger";
    changeIconAfterSubmit();
    showNotification(response.message, notificationStatus);
  }

  const changeIconAfterSubmit = async () => {
    const getStatusRank = (status) => {
        switch (status) {
            case "completed-full": return 3;
            case "completed-partial": return 2;
            case "attempted": return 1;
            default: return 0;
        }
    };

    const newStatus = testsPassed === 10 ? "completed-full" : (testsPassed >= 1 ? "completed-partial" : "attempted");

    setTasksId(prevTasksId => prevTasksId.map(t => {
        if (t.id === task._id) {
            const currentRank = getStatusRank(t.status);
            const newRank = getStatusRank(newStatus);

            if (newRank > currentRank) {
                return { ...t, status: newStatus };
            }
        }
        return t;
    }));
};

  return (
    <div className='bg-[#1B2A41] h-fit'>
      <div className='flex flex-row items-center justify-center'>
        <div className='flex flex-col items-center justify-center w-full p-4 space-y-20'>
          <select
            onChange={handleLanguageChange}
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
      <div className='relative p-4 min-h-80 m-10 bg-slate-400 border-gray-600 border-2 rounded-md h-1/3'>
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
      <div className='w-full flex flex-col mb-10 items-center'>
        <p className='text-white text-2xl'>Tasks:</p>
        <div className="w-full h-40 pb-10 flex flex-row items-center justify-center space-x-16">
          {tasksId.map(task => (
            <AssessmentStatus key={task.id} status={task.status} onClick={() => handleTaskChange(task.id)} title={task.title} />
          ))}
        </div>
        <button className="h-16 w-32 border-white bg-green-600 text-black border-2 rounded-xl mb-10" onClick={submitAll} >Finish assessment!</button>
      </div>
    </div>
  )
}

export default CodeAss