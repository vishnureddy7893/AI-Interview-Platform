import { useState } from "react";
import RecruiterSignupForm from "./components/recruiter/RecruiterSignupForm";
import RecruiterOtpForm from "./components/recruiter/RecruiterOtpForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function RecruiterSignup() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    companyName: "",
    recruiterName: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-6">

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Section */}

        <div className="hidden lg:block">

          <h1 className="text-4xl font-extrabold text-blue-600 mb-6">
            AI Interview Platform
          </h1>

          <p className="text-xl text-slate-600 mb-8">
            Hire the right talent with AI-powered recruitment.
          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                AI Resume Screening
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                Smart Candidate Matching
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                AI Interview Evaluation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                Job & Applicant Tracking
              </p>
            </div>

          </div>

        </div>

        {/* Right Section */}

        <Card className="shadow-2xl rounded-2xl">

          <CardHeader className="text-center">

            <CardTitle className="text-3xl font-bold">

              {step === 1
                ? "Create Recruiter Account"
                : "Email Verification"}

            </CardTitle>

            <p className="text-slate-500">

              {step === 1
                ? "Join the AI Hiring Platform"
                : "Enter the OTP sent to your email"}

            </p>

          </CardHeader>

          <CardContent>

            {step === 1 ? (

              <RecruiterSignupForm
                formData={formData}
                setFormData={setFormData}
                setStep={setStep}
              />

            ) : (

              <RecruiterOtpForm
                formData={formData}
                setStep={setStep}
              />

            )}

          </CardContent>

        </Card>

      </div>

    </div>
  );
}

export default RecruiterSignup;