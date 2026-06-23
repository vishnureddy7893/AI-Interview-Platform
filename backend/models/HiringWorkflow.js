const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  name: String,
  topics: [String],
  difficultyPattern: [String],
  passingScore: Number,
});

const hiringWorkflowSchema =
  new mongoose.Schema(
    {
      companyName: String,

      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },

      role: String,
      rounds: [roundSchema],

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "HiringWorkflow",
  hiringWorkflowSchema
);
