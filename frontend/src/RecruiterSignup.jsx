import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { registerCompany } from "@/services/companyService";

function RecruiterSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    email: "",
    password: "",
    confirmPassword: "",
    website: "",
    industry: "",
    companySize: "",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.companyName ||
      !formData.adminName ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Company name, admin name, email and password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await registerCompany({
        companyName: formData.companyName,
        adminName: formData.adminName,
        email: formData.email,
        password: formData.password,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        location: formData.location || undefined,
      });

      toast.success("Company registered successfully! Please login.");
      navigate("/company/login");
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-6">
            AI Hiring Platform
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Register your company and start hiring smarter with AI.
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">AI Resume Screening</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">Smart Candidate Matching</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">AI Interview Evaluation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">Job & Applicant Tracking</p>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Register Your Company
            </CardTitle>
            <p className="text-slate-500">
              Create your company account on the AI Hiring Platform
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Amazon"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    placeholder="John Doe"
                    value={formData.adminName}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Company Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Website</label>
                  <input
                    type="text"
                    name="website"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    placeholder="Technology"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Company Size</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Hyderabad"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </span>
                ) : (
                  "Register Company"
                )}
              </button>
              <p className="text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/company/login")}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RecruiterSignup;