import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams to get jobId from the route
import { getApplicationsData } from "../services/applicationService";
import { Bar } from "react-chartjs-2";
import WhiteBox from "./WhiteBox";

const PostStatistics = () => {
  const { jobId } = useParams(); // Get the jobId from the route
  const [stats, setStats] = useState({
    totalApplicants: 0,
    acceptancePercentage: 0,
    completionPercentage: 0,
    pendingApplicants: 0,
  });
  const [barChartData, setBarChartData] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchPostStatistics(jobId); // Fetch data for the specific job
    }
  }, [jobId]);

  const fetchPostStatistics = async (jobId) => {
    try {
      const response = await getApplicationsData();
      console.log("Applications data fetched:", response);

      if (response && response.groupedStatuses) {
        const jobData = response.groupedStatuses.find((group) => group.jobId === jobId);

        if (!jobData) {
          console.warn("No data found for the specified job.");
          return;
        }

        // Define all possible statuses excluding "Applying" and reorder "In Review" after "Code Challenge"
        const allStatuses = [
          "Applied",
          "Shortlisted",
          "Code Challenge",
          "In Review",
          "Rejected",
          "Accepted",
        ];

        // Ensure all statuses are included, even if their count is 0
        const filteredStatuses = allStatuses.map((status) => {
          const foundStatus = jobData.statuses.find((s) => s.status === status);
          return {
            status,
            count: foundStatus ? foundStatus.count : 0, // Default to 0 if the status is not found
          };
        });

        const totalApplicants = filteredStatuses.reduce((sum, status) => sum + status.count, 0);
        const acceptedCount = filteredStatuses.find((status) => status.status === "Accepted")?.count || 0;
        const rejectedCount = filteredStatuses.find((status) => status.status === "Rejected")?.count || 0;

        // Calculate the completion percentage (processed applicants)
        const completionPercentage = ((acceptedCount + rejectedCount) / totalApplicants) * 100 || 0;

        const pendingCount = filteredStatuses
          .filter(
            (status) =>
              status.status !== "Accepted" &&
              status.status !== "Rejected"
          )
          .reduce((sum, status) => sum + status.count, 0);

        const acceptancePercentage = (acceptedCount / totalApplicants) * 100 || 0;

        setStats({
          totalApplicants,
          acceptancePercentage,
          completionPercentage,
          pendingApplicants: pendingCount,
        });

        // Prepare data for the bar chart
        const labels = filteredStatuses.map((status) => status.status);
        const data = filteredStatuses.map((status) => status.count);

        setBarChartData({
          labels,
          datasets: [
            {
              label: "Number of Applicants",
              data,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching post statistics:", error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <WhiteBox>
          <h2 className="text-sm font-semibold text-black">Total Applicants</h2>
          <p className="text-2xl font-bold text-blue-600">{stats.totalApplicants || 0}</p>
        </WhiteBox>
        <WhiteBox>
          <h2 className="text-sm font-semibold text-black">Acceptance Percentage</h2>
          <p className="text-2xl font-bold text-green-600">{(stats.acceptancePercentage || 0).toFixed(2)}%</p>
        </WhiteBox>
        <WhiteBox>
          <h2 className="text-sm font-semibold text-black">Completion Percentage</h2>
          <p className="text-2xl font-bold text-purple-600">{(stats.completionPercentage || 0).toFixed(2)}%</p>
        </WhiteBox>
        <WhiteBox>
          <h2 className="text-sm font-semibold text-black">Pending Applicants</h2>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplicants || 0}</p>
        </WhiteBox>
      </div>

      {barChartData && (
        <WhiteBox className="p-4">
          <h2 className="text-lg font-bold mb-4">Applicants by Status</h2>
          <div style={{ height: "300px" }}> {/* Set a fixed height for the chart container */}
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false, // Allow custom height
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: false, // Disable the title
                  },
                },
              }}
            />
          </div>
        </WhiteBox>
      )}
    </div>
  );
};

export default PostStatistics;