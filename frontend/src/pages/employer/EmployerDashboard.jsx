/**
 * EmployerDashboard.jsx
 *
 * This component represents the Employer Dashboard in the application. It provides:
 * - An overview of job posts and application statistics.
 * - Visualizations such as pie charts and line graphs for application data.
 * - A dropdown to filter data by job or view all applications.
 */

import { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { getDashboardData } from "../../services/applicationService";
import { FaChartPie, FaClipboardList } from "react-icons/fa";
import WhiteBox from "../../components/WhiteBox";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

/**
 * Reusable component for displaying statistics.
 * @param {string} title - The title of the statistic.
 * @param {string|number} value - The value of the statistic.
 * @param {string} color - The color class for the value text.
 */
const StatBox = ({ title, value, color }) => (
  <WhiteBox className="text-center">
    <h2 className="text-sm font-semibold text-black">{title}</h2>
    <p className={`text-2xl font-bold mt-2 ${color} text-black`}>{value}</p>
  </WhiteBox>
);

const EmployerDashboard = () => {
  // ----------------------------- State Variables -----------------------------
  const [totalPosts, setTotalPosts] = useState(0);
  const [status, setStatus] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [lineGraphData, setLineGraphData] = useState([]);
  const [viewAllApplications, setViewAllApplications] = useState(false);

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches dashboard data from the backend and updates state variables.
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        setTotalPosts(response.totalJobs || 0);
        setStatus(response.totalStatus || []);
        setCompanyName(response.companyName || "");
        setJobs(response.jobs || []);
        setLineGraphData(response.lineGraphData || []);

        if (response.jobs && response.jobs.length > 0) {
          setSelectedJob(response.jobs[0]._id);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "Failed to load dashboard data.");
      }
    };

    fetchDashboardData();
  }, []);

  // ----------------------------- Data Transformation -----------------------------
  /**
   * Filters line graph data for the selected job or all jobs.
   * @returns {Array} - Filtered line graph data.
   */
  const getFilteredLineGraphData = () => {
    return viewAllApplications
      ? lineGraphData
      : lineGraphData.filter((entry) => entry.jobId === selectedJob);
  };

  /**
   * Transforms line graph data into a date-count map.
   * @param {Array} data - Line graph data.
   * @returns {Object} - Date-count map.
   */
  const transformLineGraphData = (data) => {
    const dateCountMap = {};
    data.forEach((entry) => {
      if (dateCountMap[entry.date]) {
        dateCountMap[entry.date] += entry.count;
      } else {
        dateCountMap[entry.date] = entry.count;
      }
    });
    return dateCountMap;
  };

  // ----------------------------- Chart Data Preparation -----------------------------
  const filteredLineData = getFilteredLineGraphData();
  const dateCountMap = transformLineGraphData(filteredLineData);

  const lineData = {
    labels: Object.keys(dateCountMap),
    datasets: [
      {
        label: "Applications",
        data: Object.values(dateCountMap),
        borderColor: "#000000",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        fill: true,
      },
    ],
  };

  const pieData = {
    labels: status
      .filter((status) => status._id !== "Applying")
      .map((status) => status._id),
    datasets: [
      {
        data: status
          .filter((status) => status._id !== "Applying")
          .map((status) => status.count),
        backgroundColor: [
          "#8B0000",
          "#00008B",
          "#006400",
          "#8B008B",
          "#FF8C00",
          "#2F4F4F",
        ],
        hoverBackgroundColor: [
          "#8B0000",
          "#00008B",
          "#006400",
          "#8B008B",
          "#FF8C00",
          "#2F4F4F",
        ],
        borderWidth: 1,
        cutout: "70%",
      },
    ],
  };

  // ----------------------------- Chart Options -----------------------------
  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#000000",
        },
        ticks: {
          color: "#000000",
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Applications",
          color: "#000000",
        },
        ticks: {
          color: "#000000",
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  // ----------------------------- Calculated Statistics -----------------------------
  const totalEngagedApplicants = status
    .filter((status) => status._id !== "Applying")
    .reduce((sum, status) => sum + status.count, 0);

  const acceptancePercentage =
    (status
      .filter((status) => status._id === "Accepted")
      .reduce((sum, status) => sum + status.count, 0) /
      totalEngagedApplicants) *
      100 || 0;

  const pendingApplicants = status
    .filter(
      (status) =>
        status._id !== "Accepted" &&
        status._id !== "Rejected" &&
        status._id !== "Applying"
    )
    .reduce((sum, status) => sum + status.count, 0);

  const engagementPercentage = totalEngagedApplicants / totalPosts || 0;

  // ----------------------------- Render -----------------------------
  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8 text-left text-black">
          Welcome back, {companyName}!
        </h1>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox
            title="Acceptance Percentage"
            value={`${acceptancePercentage.toFixed(2)}%`}
            color="text-green-600"
          />
          <StatBox
            title="Pending Applications"
            value={pendingApplicants}
            color="text-yellow-600"
          />
          <StatBox
            title="Engagement Percentage"
            value={`${engagementPercentage.toFixed(2)}%`}
            color="text-blue-600"
          />
          <StatBox
            title="Total Job Posts"
            value={totalPosts}
            color="text-purple-600"
          />
        </div>

        {/* Charts */}
        <div className="flex gap-4">
          {/* Pie Chart */}
          <WhiteBox className="max-w-md md:p-4">
            <h2 className="text-xl font-semibold text-black mb-4 flex items-center pt-2">
              <FaChartPie className="mr-2" /> Status Overview
            </h2>
            <div className="w-64 h-64 mx-auto relative">
              <Pie data={pieData} options={pieOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold text-gray-700">
                  {totalEngagedApplicants}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap justify-center">
                {status
                  .filter((status) => status._id !== "Applying")
                  .map((status, index) => (
                    <div
                      key={status._id}
                      className="flex items-center mx-4 my-2"
                    >
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            pieData.datasets[0].backgroundColor[index],
                        }}
                      ></span>
                      <p className="ml-2 text-sm text-gray-700 capitalize">
                        {status._id}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </WhiteBox>

          {/* Line Graph */}
          <WhiteBox className="flex-1 md:p-4">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-black mr-2 flex items-center">
                <FaClipboardList className="mr-2" /> Applications for:
              </h2>
              <select
                id="job-select"
                className="p-2 border rounded w-64"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                disabled={viewAllApplications}
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <div className="flex items-center ml-4">
                <label className="mr-2 text-sm font-medium text-gray-700">
                  View All Applications:
                </label>
                <input
                  type="checkbox"
                  checked={viewAllApplications}
                  onChange={(e) => setViewAllApplications(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
            <div className="flex justify-center h-80 w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
          </WhiteBox>
        </div>

        {/* Error Message */}
        {error && (
          <WhiteBox className="mt-6 bg-red-100 text-red-600 p-4 rounded-lg">
            <p>{error}</p>
          </WhiteBox>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;