import { useState, useEffect, useCallback } from "react";
import { Loader2, UserPlus, Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import { getRecruiters, getPendingInvitations, inviteRecruiter } from "@/services/teamService";

function TeamManagement() {
  const [recruiters, setRecruiters] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    recruitername: "",
    email: "",
    designation: "",
    department: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recruitersRes, invitationsRes] = await Promise.all([
        getRecruiters(),
        getPendingInvitations(),
      ]);
      setRecruiters(recruitersRes.data?.recruiters || []);
      setInvitations(invitationsRes.data?.invitations || []);
    } catch {
      setFeedback({ type: "error", message: "Failed to load team data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!formData.recruitername || !formData.email || !formData.designation || !formData.department) {
      setFeedback({ type: "error", message: "All fields are required" });
      return;
    }

    try {
      setSubmitting(true);
      await inviteRecruiter({
        recruiterName: formData.recruitername,
        email: formData.email,
        designation: formData.designation,
        department: formData.department,
      });
      setFeedback({ type: "success", message: "Invitation sent successfully" });
      setFormData({ recruitername: "", email: "", designation: "", department: "" });
      setShowForm(false);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send invitation";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">Manage your recruiters and invitations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
        >
          <UserPlus size={16} />
          Invite Recruiter
        </button>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {feedback.message}
        </div>
      )}

      {/* Invite Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Invitation</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="recruitername"
                  placeholder="John Doe"
                  value={formData.recruitername}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="recruiter@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  placeholder="HR Manager"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="Human Resources"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                {submitting ? "Sending..." : "Send Invitation"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFeedback({ type: "", message: "" }); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recruiters List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Recruiters</h2>
          <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {recruiters.length}
          </span>
        </div>
        {recruiters.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No recruiters yet. Invite your first recruiter to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Designation</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((recruiter) => (
                  <tr key={recruiter._id} className="border-b border-gray-50 text-sm hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{recruiter.recruiterName}</td>
                    <td className="px-6 py-4 text-gray-600">{recruiter.email}</td>
                    <td className="px-6 py-4 text-gray-600">{recruiter.designation}</td>
                    <td className="px-6 py-4 text-gray-600">{recruiter.department || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          recruiter.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {recruiter.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {recruiter.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400">—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <Clock size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
          <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {invitations.length}
          </span>
        </div>
        {invitations.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No pending invitations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Sent Date</th>
                </tr>
              </thead>
              <tbody>
                {invitations
                  .filter((inv) => !inv.accepted)
                  .map((inv) => (
                    <tr key={inv._id} className="border-b border-gray-50 text-sm hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.recruiterName}</td>
                      <td className="px-6 py-4 text-gray-600">{inv.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                          <Clock size={12} />
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamManagement;