import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function RecruiterOtpForm({
  formData,
  setStep,
}) {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/recruiter/verify-otp",
        {
          companyName: formData.companyName,
          recruiterName: formData.recruiterName,
          designation: formData.designation,
          email: formData.email,
          password: formData.password,
          otp,
        }
      );

      if (res.data.success) {
        toast.success("Recruiter Registered Successfully 🎉");

        navigate("/recruiter/login");
      }

    } catch (error) {

      toast.error(
  error.response?.data?.message ||
  "OTP Verification Failed"
);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="space-y-6">

      <h2 className="text-center text-2xl font-bold">
        Verify Your Email
      </h2>

      <p className="text-center text-gray-500">
        We have sent an OTP to
      </p>

      <p className="text-center font-semibold text-blue-600">
        {formData.email}
      </p>

      <input
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        onClick={() => setStep(1)}
        className="w-full rounded-xl border py-3"
      >
        Back
      </button>

    </div>
  );
}

export default RecruiterOtpForm;