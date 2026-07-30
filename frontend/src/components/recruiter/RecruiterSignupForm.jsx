import { useState } from "react";
import { toast } from "sonner";

import api from "@/config/api";

function RecruiterSignupForm({
  formData,
  setFormData,
  setStep,
}) {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = async (e) => {
  e.preventDefault();

  console.log("🔥 Continue clicked");
  console.log(formData);

  if (
    !formData.companyName ||
    !formData.recruiterName ||
    !formData.designation ||
    !formData.email ||
    !formData.phone ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    toast.error("Please fill all fields");
    return;
  }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
   console.log("🚀 Calling send-otp API...");
      const res = await api.post(
        "/recruiter/send-otp",
        {
          email: formData.email,
        }
      );

      if (res.data.success) {
        toast.success("OTP sent successfully ");
        setStep(2);
      }
    } catch (error) {
      toast.error(
  error.response?.data?.message ||
    "Something went wrong"
);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleContinue}
      className="space-y-5"
    >
      {/* First Row */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Name
          </label>

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
          <label className="mb-2 block text-sm font-medium">
            Recruiter Name
          </label>

          <input
            type="text"
            name="recruiterName"
            placeholder="John"
            value={formData.recruiterName}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      {/* Second Row */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Designation
          </label>

          <input
            type="text"
            name="designation"
            placeholder="HR Manager"
            value={formData.designation}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone Number
          </label>

          <input
            type="text"
            name="phone"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      {/* Email */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Company Email
        </label>

        <input
          type="email"
          name="email"
          placeholder="hr@company.com"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      {/* Password */}

      <div>
        <label className="mb-2 block text-sm font-medium">
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

      {/* Confirm Password */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Confirm Password
        </label>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      {/* Terms */}

      <div className="flex gap-3">
        <input type="checkbox" required />

        <p className="text-sm text-gray-600">
          I agree to the{" "}
          <span className="font-semibold text-blue-600">
            Terms & Conditions
          </span>
        </p>
      </div>

      {/* Continue */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
      >
        {loading ? "Sending OTP..." : "Continue"}
      </button>
    </form>
  );
}

export default RecruiterSignupForm;