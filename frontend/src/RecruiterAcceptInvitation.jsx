import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/config/api";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

function RecruiterAcceptInvitation() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  console.log("Invitation Token:", token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      setError("Invalid invitation link.");
      setLoading(false);
    }
  }, []);

  async function loadInvitation() {
    try {
      const res = await api.get(`/team/invitation/${token}`);
      console.log("API RESPONSE:", res);
    console.log("API DATA:", res.data);

      setInvitation(res.data.data);
    } catch (err) {
      console.log("API ERROR:", err);
    console.log("API ERROR RESPONSE:", err.response);
      setError(
        err.response?.data?.message ||
          "Failed to load invitation."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvitation(e) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/team/accept-invitation", {
        invitationToken: token,
        password,
      });

      toast.success("Recruiter account activated successfully!");

      setTimeout(() => {
  navigate("/recruiter/login");
}, 1500);
    } catch (err) {
      toast.error(
  err.response?.data?.message ||
  "Failed to accept invitation."
);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-semibold">
          Loading Invitation...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Invitation Error
          </h2>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-center mb-8">
          Recruiter Invitation
        </h1>

        <div className="space-y-5">

          <div>
            <label className="font-semibold">
              Company
            </label>

            <div className="bg-gray-100 rounded-lg p-3 mt-1">
              {invitation.companyName}
            </div>
          </div>

          <div>
            <label className="font-semibold">
              Recruiter Name
            </label>

            <div className="bg-gray-100 rounded-lg p-3 mt-1">
              {invitation.recruiterName}
            </div>
          </div>

          <div>
            <label className="font-semibold">
              Email
            </label>

            <div className="bg-gray-100 rounded-lg p-3 mt-1">
              {invitation.email}
            </div>
          </div>

          <div>
            <label className="font-semibold">
              Designation
            </label>

            <div className="bg-gray-100 rounded-lg p-3 mt-1">
              {invitation.designation}
            </div>
          </div>

          <div>
            <label className="font-semibold">
              Department
            </label>

            <div className="bg-gray-100 rounded-lg p-3 mt-1">
              {invitation.department}
            </div>
          </div>

          <form
            onSubmit={handleAcceptInvitation}
            className="space-y-5 pt-6"
          >

            <div>
              <label className="font-semibold">
                Create Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border rounded-lg p-3 mt-1"
                placeholder="Enter Password"
              />
            </div>

            <div>
              <label className="font-semibold">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full border rounded-lg p-3 mt-1"
                placeholder="Confirm Password"
              />
            </div>
           <div className="text-sm mt-2">
  Password Strength:
  {" "}
  {password.length < 6 && (
    <span className="text-red-600 font-semibold">
      Weak
    </span>
  )}

  {password.length >= 6 &&
    password.length < 10 && (
      <span className="text-yellow-500 font-semibold">
        Medium
      </span>
    )}

  {password.length >= 10 && (
    <span className="text-green-600 font-semibold">
      Strong
    </span>
  )}
</div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition"
            >
              {submitting
                ? "Creating Account..."
                : "Accept Invitation"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default RecruiterAcceptInvitation;