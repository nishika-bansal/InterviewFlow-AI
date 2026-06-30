const { GoogleGenerativeAI } = require("@google/generative-ai");

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[geminiService] GEMINI_API_KEY is NOT set in process.env. Check your .env file and that dotenv is loaded BEFORE this file runs.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
  } catch (error) {
    console.error("[geminiService] Failed to initialize Gemini model:", error.message);
    return null;
  }
}

function parseJson(text, fallback) {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonText = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("[geminiService] Failed to parse Gemini JSON response:", error.message);
    console.error("[geminiService] Raw text was:", text);
    return fallback;
  }
}

async function generateJson(prompt, fallback) {
  const model = getModel();

  if (!model) {
    console.warn("[geminiService] No model available, returning fallback data.");
    return fallback;
  }

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });
    const text = result.response.text();
    return parseJson(text, fallback);
  } catch (error) {
    // THIS is the part that was hiding your real problem.
    console.error("[geminiService] Gemini API call FAILED:", error.message);
    if (error.status) console.error("[geminiService] status:", error.status);
    if (error.errorDetails) console.error("[geminiService] details:", JSON.stringify(error.errorDetails));
    return fallback;
  }
}

function fallbackResumeAnalysis(targetRole) {
  return {
    skills: ["JavaScript", "React.js", "Node.js", "Express.js", "MongoDB"],
    projects: ["AI Interview and Resume Analyzer", "Full-stack MERN application"],
    education: ["Education details detected from resume text"],
    experience: ["Experience details detected from resume text"],
    missingSkills: ["System design basics", "Testing", "Cloud deployment"],
    summary:
      "The resume shows strong full-stack development potential with practical MERN stack skills and scope to improve measurable impact and deployment details.",
    improvementSuggestions: [
      "Add quantified achievements for every major project.",
      "Mention deployment links, GitHub links and live demo URLs.",
      "Group technical skills by frontend, backend, database and tools.",
      "Add role-specific keywords for applicant tracking systems."
    ],
    score: 78,
    targetRole: targetRole || "Full Stack Developer"
  };
}

async function analyzeResumeText({ resumeText, targetRole }) {
  const fallback = fallbackResumeAnalysis(targetRole);
  const prompt = `
You are an expert resume reviewer. Analyze this resume for the target role: ${targetRole || "Software Developer"}.
Return only valid JSON using this exact shape:
{
  "skills": ["skill"],
  "projects": ["project"],
  "education": ["education"],
  "experience": ["experience"],
  "missingSkills": ["missing skill"],
  "summary": "short summary",
  "improvementSuggestions": ["suggestion"],
  "score": 0,
  "targetRole": "role"
}
Resume text:
${resumeText || "No resume text found"}
`;

  return generateJson(prompt, fallback);
}

function fallbackQuestions({ difficulty, category, company }) {
  const companyPrefix = company ? ` for ${company}` : "";
  return {
    questions: [
      {
        type: "hr",
        question: `Tell me about yourself and why you are a good fit${companyPrefix}.`,
        expectedAnswer: "A concise introduction covering background, skills, projects and motivation.",
        skill: "Communication",
        followUps: ["What makes this role exciting for you?"]
      },
      {
        type: "technical",
        question: "Explain how JWT authentication works in a MERN application.",
        expectedAnswer:
          "JWT is issued after login, stored by the client, sent in Authorization header and verified by protected backend middleware.",
        skill: "JWT Authentication",
        followUps: ["How would you handle token expiry?"]
      },
      {
        type: "project",
        question: "Describe the architecture of your AI resume analyzer project.",
        expectedAnswer:
          "React frontend, Express MVC backend, MongoDB models, Multer upload pipeline and Gemini service integration.",
        skill: "System Design",
        followUps: ["Which module was most challenging?"]
      },
      {
        type: "behavioral",
        question: "Tell me about a time you debugged a difficult issue.",
        expectedAnswer: "Use the STAR method with clear problem, action and result.",
        skill: "Problem Solving",
        followUps: ["What did you learn from it?"]
      },
      {
        type: "follow-up",
        question: `What would you improve in this project at a ${difficulty || "medium"} level?`,
        expectedAnswer: "Discuss testing, deployment, monitoring, prompt quality and security improvements.",
        skill: "Ownership",
        followUps: ["How would you prioritize those improvements?"]
      }
    ]
  };
}

async function generateInterviewQuestions({ resumeAnalysis, difficulty, category, company, count }) {
  const fallback = fallbackQuestions({ difficulty, category, company });
  const prompt = `
You are an interviewer. Generate ${count || 8} interview questions.
Difficulty: ${difficulty || "medium"}
Category: ${category || "mixed"}
Company: ${company || "general product company"}
Use this resume analysis:
${JSON.stringify(resumeAnalysis || {}, null, 2)}
Return only valid JSON:
{
  "questions": [
    {
      "type": "hr | technical | project | behavioral | follow-up",
      "question": "question text",
      "expectedAnswer": "what a strong answer should include",
      "skill": "skill being tested",
      "followUps": ["follow up question"]
    }
  ]
}
`;

  return generateJson(prompt, fallback);
}

function fallbackFeedback() {
  return {
    strengths: ["Clear structure", "Relevant technical points", "Good project ownership"],
    weaknesses: ["Could include more metrics", "Needs stronger examples", "Some answers need more depth"],
    suggestions: [
      "Use the STAR format for behavioral answers.",
      "Add exact tools, tradeoffs and measurable outcomes.",
      "Close each answer with what you learned or improved."
    ],
    score: 76,
    summary:
      "The response is interview-ready but can become stronger with sharper examples, measurable impact and clearer tradeoffs."
  };
}

async function evaluateInterviewAnswers({ questions, answers, difficulty }) {
  const fallback = fallbackFeedback();
  const prompt = `
Evaluate these interview answers at ${difficulty || "medium"} difficulty.
Questions:
${JSON.stringify(questions || [], null, 2)}
Answers:
${JSON.stringify(answers || [], null, 2)}
Return only valid JSON:
{
  "strengths": ["strength"],
  "weaknesses": ["weakness"],
  "suggestions": ["suggestion"],
  "score": 0,
  "summary": "overall feedback"
}
`;

  return generateJson(prompt, fallback);
}

async function generateCoverLetter({ user, resumeAnalysis, company, role, jobDescription }) {
  const fallback = {
    coverLetter: `Dear Hiring Manager,\n\nI am excited to apply for the ${role || "Software Developer"} role${company ? ` at ${company}` : ""}. My experience with ${((resumeAnalysis && resumeAnalysis.skills) || ["React.js", "Node.js", "MongoDB"]).slice(0, 4).join(", ")} and hands-on project work makes me confident that I can contribute quickly.\n\nIn my recent work, I built full-stack applications with secure authentication, REST APIs and AI integrations. I enjoy turning product requirements into reliable user experiences and continuously improving based on feedback.\n\nThank you for considering my application. I would welcome the opportunity to discuss how my skills align with your team.\n\nSincerely,\n${user.name}`
  };
  const prompt = `
Write a concise, professional cover letter.
Candidate: ${user.name}
Target role: ${role || "Software Developer"}
Company: ${company || "the company"}
Resume analysis:
${JSON.stringify(resumeAnalysis || {}, null, 2)}
Job description:
${jobDescription || "Not provided"}
Return only valid JSON:
{
  "coverLetter": "letter text"
}
`;

  return generateJson(prompt, fallback);
}

module.exports = {
  analyzeResumeText,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  generateCoverLetter
};