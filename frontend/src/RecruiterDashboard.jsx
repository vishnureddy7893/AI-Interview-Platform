import { useNavigate } from "react-router-dom";
import { RecruiterInterviewList } from "./components/recruiter/RecruiterInterviewReview";
import { RecruiterApplicationsPanel } from "./components/recruiter/RecruiterApplications";

function RecruiterDashboard() {
  const navigate = useNavigate();

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
            12
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Applications
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            148
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Interviews
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            37
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500">
            Hired
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            9
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

              <tr className="border-b">

                <td className="py-4">
                  Software Engineer
                </td>

                <td>
                  Hyderabad
                </td>

                <td>
                  0-2 Years
                </td>

                <td>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">

                    Open

                  </span>

                </td>

              </tr>

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