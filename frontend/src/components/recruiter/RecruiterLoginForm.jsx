import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterLoginForm() {
  const navigate = useNavigate();

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

  const handleLogin = (e) => {
    e.preventDefault();

    // API will be connected later

    navigate("/recruiter/dashboard");
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
          placeholder="hr@company.com"
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

        <button
          type="button"
          className="text-blue-600 hover:underline"
        >
          Forgot Password?
        </button>

      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
      >
        Login
      </button>

      <p className="text-center text-sm text-gray-600">

        Don't have an account?

        <button
          type="button"
          onClick={() => navigate("/recruiter/signup")}
          className="ml-2 font-semibold text-blue-600 hover:underline"
        >
          Register
        </button>

      </p>

    </form>
  );
}

export default RecruiterLoginForm;
