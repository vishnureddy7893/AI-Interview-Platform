const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Activity = require("../models/Activity");

exports.getDashboard = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Candidate
    const candidate = await Candidate.findById(candidateId).select("-password");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Applications
    const applications = await Application.find({
      candidateId,
    });

    // Upcoming Interview
    const upcomingInterview = await Interview.findOne({
      candidateId,
      status: "Scheduled",
    })
      .populate("jobId")
      .sort({ interviewDate: 1 });

    // Recent Activities
    const recentActivities = await Activity.find({
      candidateId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,

      candidate,

      stats: {
        appliedJobs: applications.length,
        underReview: applications.filter(
          (a) => a.status === "Under Review"
        ).length,

        interviews: applications.filter(
          (a) => a.status === "Interview"
        ).length,

        offers: applications.filter(
          (a) => a.status === "Offer"
        ).length,
      },

      upcomingInterview,

      recentActivities,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};