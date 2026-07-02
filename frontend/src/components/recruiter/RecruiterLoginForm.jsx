import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loginRecruiter } from "@/services/recruiterService";

function RecruiterLoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await loginRecruiter({
        email: loginData.email,
        password: loginData.password,
      });

      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: response.token,
          role: response.recruiter.role,
          user: response.recruiter,
        })
      );

      toast.success("Login Successful!");
      navigate("/recruiter/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">
          Company Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="recruiter@company.com"
          value={loginData.email}
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
          value={loginData.password}
          onChange={handleChange}
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div className="flex justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Remember Me
        </label>
        <button type="button" className="text-blue-600 hover:underline">
          Forgot Password?
        </button>
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
  );
}

export default RecruiterLoginForm;