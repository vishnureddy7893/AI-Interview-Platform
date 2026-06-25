import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { loginCompany } from "@/services/companyService";

function CompanyLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await loginCompany({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: response.token,
          role: response.user.role,
          user: response.user,
        })
      );

      toast.success("Login Successful!");
      navigate("/company/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login Failed";
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
            Company admin portal — manage your hiring pipeline.
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">Manage Job Openings</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">Team & Recruiter Management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">AI Candidate Evaluation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">Hiring Analytics Dashboard</p>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Company Admin Login
            </CardTitle>
            <p className="text-slate-500">
              Login to manage your company and team
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CompanyLogin;