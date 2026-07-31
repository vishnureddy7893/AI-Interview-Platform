export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "c", label: "C", monaco: "c" },
];

export const EDITOR_THEMES = [
  { id: "vs-dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export const FONT_SIZES = [12, 14, 16, 18, 20];

export const CODE_TEMPLATES = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
}

// Example usage (local only — execution coming soon)
// console.log(twoSum([2,7,11,15], 9));
`,
  python: `from typing import List

def two_sum(nums: List[int], target: int) -> List[int]:
    # Write your solution here
    pass

# Example usage (local only — execution coming soon)
# print(two_sum([2, 7, 11, 15], 9))
`,
  java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}
`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};
`,
  c: `#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 0;
    return NULL;
}
`,
};

/**
 * Build a display problem from round settings until problem APIs exist.
 * Future: replace with Assessment.problem from backend.
 */
export function buildPlaceholderProblem({ settings = {}, job, company, round } = {}) {
  const topics = Array.isArray(settings.topics) && settings.topics.length
    ? settings.topics
    : ["Arrays", "Hash Map"];
  const difficulty = settings.difficulty || "Medium";
  const duration = Number(settings.duration) || 60;
  const languages = Array.isArray(settings.language) && settings.language.length
    ? settings.language
    : SUPPORTED_LANGUAGES.map((l) => l.label);

  return {
    id: "placeholder-two-sum",
    title: "Two Sum",
    questionNumber: 1,
    totalQuestions: Number(settings.questionCount) || 1,
    difficulty,
    topics,
    timeLimitMinutes: duration,
    memoryLimitMb: 256,
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    inputFormat:
      "The first line contains the array `nums` and the integer `target` for each test case.",
    outputFormat:
      "Return an array of two integers — the indices of the pair that sums to `target`.",
    examples: [
      {
        id: "ex1",
        title: "Example 1",
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        id: "ex2",
        title: "Example 2",
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "nums[1] + nums[2] == 6.",
      },
    ],
    sampleTests: [
      {
        id: "t1",
        title: "Test Case 1",
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
      },
      {
        id: "t2",
        title: "Test Case 2",
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
      },
    ],
    recruiterInstructions:
      round?.settings?.recruiterInstructions ||
      "Solve the problem within the allotted time. Integrity monitoring is enabled. Do not switch tabs or use restricted shortcuts.",
    companyName: company?.companyName || job?.companyName || "Company",
    companyLogo: company?.logoUrl || null,
    jobTitle: job?.title || "Coding Assessment",
    roundTitle: round?.title || round?.type || "Coding",
    allowedLanguages: languages,
  };
}

export function mapRoundLanguageToId(label) {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("javascript") || normalized === "js") return "javascript";
  if (normalized.includes("python")) return "python";
  if (normalized.includes("java") && !normalized.includes("script")) return "java";
  if (normalized.includes("c++") || normalized.includes("cpp")) return "cpp";
  if (normalized === "c") return "c";
  return "javascript";
}
