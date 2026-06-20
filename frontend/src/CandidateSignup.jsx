import CandidateSignupForm from "./components/candidate/CandidateSignupForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CandidateSignup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Section */}
        <div className="hidden lg:block">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-6">
            AI Interview Platform
          </h1>

          <p className="text-xl text-slate-600 mb-8">
            Start your AI-powered interview journey today.
          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                AI Powered Interviews
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                Resume Based Questions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                Coding & MCQ Assessments
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <p className="text-lg text-slate-700">
                Instant AI Evaluation
              </p>
            </div>

          </div>
        </div>

        {/* Right Section */}
        <Card className="shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Create Your Account
            </CardTitle>

            <p className="text-slate-500">
              Join the AI Interview Platform
            </p>
          </CardHeader>

          <CardContent>
            <CandidateSignupForm />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default CandidateSignup;