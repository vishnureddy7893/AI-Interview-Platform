import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { RecruiterInterviewList } from "./components/recruiter/RecruiterInterviewReview";
import { RecruiterApplicationsPanel } from "./components/recruiter/RecruiterApplications";
import { listJobs } from "@/services/jobService";
import { listCompanyApplications } from "@/services/applicationService";
import { listCompanyInterviews } from "@/services/interviewService";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        // All three endpoints are company-scoped server-side
        // (resolveActorFromRequest), so nothing here needs a company filter.
        const [jobData, appData, interviewData] = await Promise.all([
          listJobs(),
          listCompanyApplications(),
          listCompanyInterviews(),
        ]);

        if (!mounted) return;
        setJobs(jobData.jobs || []);
        setApplications(appData.applications || []);
        setInterviews(interviewData.interviews || []);
      } catch (error) {
        if (mounted) {
          toast.error(
            error.response?.data?.message || "Failed to load dashboard"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // listJobs already excludes archived jobs (isDeleted); Closed is filtered
  // here so a closed-but-not-archived job never counts as active.
  const activeJobs = jobs.filter((job) => job.status !== "Closed");
  const hiredCount = applications.filter(
    (app) => app.recruiterStatus === "Hired"
  ).length;
  const recentJobs = jobs.slice(0, 5);

  const showStat = (value) => (loading ? "—" : value);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-white shadow-sm">

        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

          <div>
            <h1 className="text-3xl font-bold">
              Recruiter Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Welcome back! Manage jobs and candidates.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg bg-black px-6 py-3 text-white"
            onClick={() => navigate("/recruiter/jobs/create")}
          >
            + Create Job
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Active Jobs
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            {showStat(activeJobs.length)}
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Applications
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            {showStat(applications.length)}
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Interviews
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            {showStat(interviews.length)}
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Hired
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            {showStat(hiredCount)}
          </h1>
        </div>

      </div>

      {/* Recent Jobs */}

      <div className="max-w-7xl mx-auto px-8 pb-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Recent Job Posts
          </h2>

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left py-3">
                  Role
                </th>

                <th className="text-left">
                  Location
                </th>

                <th className="text-left">
                  Experience
                </th>

                <th className="text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={4}>
                    Loading jobs…
                  </td>
                </tr>
              ) : recentJobs.length === 0 ? (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={4}>
                    No jobs posted yet.
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr
                    key={job._id}
                    className="border-b cursor-pointer hover:bg-slate-50"
                    onClick={() =>
                      navigate(`/recruiter/jobs/${job._id}/edit`)
                    }
                  >

                    <td className="py-4">
                      {job.title}
                    </td>

                    <td>
                      {job.location || "—"}
                    </td>

                    <td>
                      {job.experience || "—"}
                    </td>

                    <td>

                      <span
                        className={`rounded-full px-3 py-1 ${
                          job.status === "Closed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >

                        {job.status}

                      </span>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-8 pb-10">
        <RecruiterApplicationsPanel />
        <RecruiterInterviewList />
      </div>

    </div>
  );
}

export default RecruiterDashboard;