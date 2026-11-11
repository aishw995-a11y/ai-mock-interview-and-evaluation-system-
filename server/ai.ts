import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize GoogleGenAI server-side with user-agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GeneratedQuestion {
  question_text: string;
  category: string;
  rationale: string;
}

export interface QuestionFeedbackResult {
  questionIndex: number;
  question: string;
  answer: string;
  score: number;
  strengths: string;
  improvements: string;
  missingPoints: string[];
  idealAnswer: string;
}

export interface GeneratedEvaluation {
  overall_score: number;
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  problem_solving_score: number;
  language_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_points: string[];
  question_feedback: QuestionFeedbackResult[];
  improvement_suggestions: string[];
  recommended_topics: string[];
}

/**
 * Generate customized interview questions based on job role, category, candidate profile & resume
 */
export async function generateInterviewQuestions(params: {
  jobRole: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  skills?: string[];
  resumeText?: string;
  programmingLanguage?: string;
}): Promise<GeneratedQuestion[]> {
  const { jobRole, category, difficulty, durationMinutes, skills, resumeText, programmingLanguage } = params;

  // Compute number of questions based on duration: ~2.5 - 3 minutes per question
  let questionCount = 4;
  if (durationMinutes <= 5) questionCount = 2;
  else if (durationMinutes <= 10) questionCount = 3;
  else if (durationMinutes <= 15) questionCount = 5;
  else if (durationMinutes <= 30) questionCount = 7;

  const prompt = `
You are an expert technical hiring manager, principal engineer, and executive recruiter conducting an interview for the role of "${jobRole}".
Interview Category: "${category}"
Candidate Experience Level: "${difficulty}"
Target Duration: ${durationMinutes} minutes.
Selected Programming Language: ${programmingLanguage || 'Language-agnostic / Best fit'}
${skills && skills.length > 0 ? `Candidate Stated Skills: ${skills.join(', ')}` : ''}
${resumeText ? `Candidate Resume Excerpt:\n"""\n${resumeText.slice(0, 2000)}\n"""` : ''}

Generate exactly ${questionCount} authentic, progressive interview questions tailored specifically to this candidate and role.
Requirements:
1. Progress logically: Start with a solid grounding/introductory question, advance into deeper core technical or behavioral challenges, and conclude with situational problem-solving or system trade-offs.
2. If resume or skills are provided, reference their specific technology stack or projects naturally.
3. Questions must be crisp, open-ended, and realistic—identical to what top tech companies and hiring teams ask.
4. Avoid generic trivia questions (e.g. avoid "what is a variable"). Prefer situational depth, architecture decisions, edge cases, and real-world debugging.

Return a valid JSON array of objects with the exact schema:
[
  {
    "question_text": "string (the interview question prompt)",
    "category": "string (e.g. 'Core Architecture', 'Data Structures', 'Behavioral Leadership', 'Live Debugging')",
    "rationale": "string (why this question is critical for this candidate & role)"
  }
]
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite corporate technical interviewer and HR leader. Always output strictly valid JSON with no markdown wrapping or preamble.',
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            question_text: String(item.question_text || ''),
            category: String(item.category || category),
            rationale: String(item.rationale || ''),
          }));
        }
      }
    } catch (err) {
      console.warn('Gemini API question generation failed or rate limited, using domain fallback:', err);
    }
  }

  // High-fidelity fallback questions tailored to role & category
  return getFallbackQuestions(jobRole, category, difficulty, questionCount, programmingLanguage);
}

/**
 * Generate an adaptive follow-up question if an answer requires clarification
 */
export async function generateFollowUpQuestion(params: {
  jobRole: string;
  currentQuestion: string;
  candidateAnswer: string;
}): Promise<string | null> {
  const { jobRole, currentQuestion, candidateAnswer } = params;
  if (!ai || candidateAnswer.trim().length < 30) return null;

  const prompt = `
You are the interviewer for a "${jobRole}" position.
You just asked: "${currentQuestion}"
The candidate answered: "${candidateAnswer}"

If their answer leaves a notable technical ambiguity, mentions an intriguing technology, or skims over performance trade-offs, formulate ONE concise, professional follow-up question (1-2 sentences) to dig deeper.
If their answer was already completely thorough and conclusive, respond with NULL.

Return JSON:
{
  "hasFollowUp": boolean,
  "followUpQuestion": string or null
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    if (text) {
      const parsed = JSON.parse(text);
      if (parsed.hasFollowUp && parsed.followUpQuestion) {
        return parsed.followUpQuestion;
      }
    }
  } catch (err) {
    console.warn('Follow-up generation skipped:', err);
  }
  return null;
}

/**
 * Deep AI evaluation of all candidate answers
 */
export async function evaluateInterviewAnswers(params: {
  jobRole: string;
  category: string;
  difficulty: string;
  questions: Array<{ index: number; text: string; category?: string }>;
  answers: Array<{ index: number; text: string; mode: string; duration?: number }>;
}): Promise<GeneratedEvaluation> {
  const { jobRole, category, difficulty, questions, answers } = params;

  const qaContext = questions.map(q => {
    const ans = answers.find(a => a.index === q.index);
    return `[Question ${q.index + 1}] (${q.category || 'General'}): ${q.text}
[Candidate Answer (${ans?.mode || 'text'}, ${ans?.duration || 0}s)]: ${ans?.text || '(No answer provided)'}`;
  }).join('\n\n');

  const prompt = `
You are a Lead Hiring Reviewer and Principal Evaluator assessing a candidate's completed mock interview for "${jobRole}".
Interview Track: ${category}
Target Seniority/Difficulty: ${difficulty}

Here is the exact transcript of questions and submitted candidate answers:
=== INTERVIEW TRANSCRIPT ===
${qaContext}
=== END TRANSCRIPT ===

Perform a rigorous, fair, and encouraging assessment based strictly on what the candidate actually answered.
Evaluate the following six key dimensions on a 0-100 scale:
1. Technical Knowledge: Accuracy, depth, adherence to modern engineering best practices.
2. Answer Relevance: Directness, avoidance of filler, answering what was asked.
3. Communication Skills: Clarity, structural coherence, concise articulation.
4. Problem-Solving Ability: Analytical reasoning, consideration of trade-offs, edge case handling.
5. Grammar and Language: Professional vocabulary, readability, fluency.
6. Confidence and Clarity: Firmness of conviction, vocal pacing or decisive logical assertions. (Evaluate linguistic and structural confidence cautiously).

Calculate an Overall Score (0-100, weighted appropriately).
Provide:
- Strengths: 3 to 4 specific, actionable praises grounded in quotes or points they made.
- Weaknesses: 2 to 3 constructive critiques identifying areas to strengthen.
- Missing Important Points: Key industry concepts or frameworks they neglected to mention.
- Question-by-question Feedback: For EACH question in the transcript, provide:
  * score (0-100)
  * strengths (1-2 sentences)
  * improvements (1-2 sentences)
  * missingPoints (list of 2-3 specific topics)
  * idealAnswer (a pristine, exemplary answer that a senior engineer would deliver, 2-4 sentences)
- Improvement Suggestions: 3 practical tips for their next real-world interview.
- Recommended Topics: 3 specific technical or communication subjects to study next.

Return strictly a valid JSON object matching this structure:
{
  "overall_score": number,
  "technical_score": number,
  "relevance_score": number,
  "communication_score": number,
  "problem_solving_score": number,
  "language_score": number,
  "confidence_score": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missing_points": ["string"],
  "question_feedback": [
    {
      "questionIndex": number,
      "question": "string",
      "answer": "string",
      "score": number,
      "strengths": "string",
      "improvements": "string",
      "missingPoints": ["string"],
      "idealAnswer": "string"
    }
  ],
  "improvement_suggestions": ["string"],
  "recommended_topics": ["string"]
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an objective, high-bar tech interview evaluation engine. Output strictly valid JSON.',
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.overall_score !== undefined && Array.isArray(parsed.question_feedback)) {
          return {
            overall_score: Math.min(100, Math.max(0, Math.round(parsed.overall_score))),
            technical_score: Math.min(100, Math.max(0, Math.round(parsed.technical_score || parsed.overall_score))),
            relevance_score: Math.min(100, Math.max(0, Math.round(parsed.relevance_score || parsed.overall_score))),
            communication_score: Math.min(100, Math.max(0, Math.round(parsed.communication_score || parsed.overall_score))),
            problem_solving_score: Math.min(100, Math.max(0, Math.round(parsed.problem_solving_score || parsed.overall_score))),
            language_score: Math.min(100, Math.max(0, Math.round(parsed.language_score || parsed.overall_score))),
            confidence_score: Math.min(100, Math.max(0, Math.round(parsed.confidence_score || parsed.overall_score))),
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
            missing_points: Array.isArray(parsed.missing_points) ? parsed.missing_points : [],
            question_feedback: parsed.question_feedback.map((qf: any) => ({
              questionIndex: Number(qf.questionIndex ?? 0),
              question: String(qf.question || ''),
              answer: String(qf.answer || ''),
              score: Math.min(100, Math.max(0, Math.round(qf.score || 70))),
              strengths: String(qf.strengths || ''),
              improvements: String(qf.improvements || ''),
              missingPoints: Array.isArray(qf.missingPoints) ? qf.missingPoints : [],
              idealAnswer: String(qf.idealAnswer || ''),
            })),
            improvement_suggestions: Array.isArray(parsed.improvement_suggestions) ? parsed.improvement_suggestions : [],
            recommended_topics: Array.isArray(parsed.recommended_topics) ? parsed.recommended_topics : [],
          };
        }
      }
    } catch (err) {
      console.warn('Gemini evaluation API error, running heuristic evaluation:', err);
    }
  }

  // Heuristic evaluation fallback when API is not reachable
  return calculateHeuristicEvaluation(jobRole, category, questions, answers);
}

/**
 * Built-in domain fallbacks for questions
 */
function getFallbackQuestions(
  role: string,
  category: string,
  difficulty: string,
  count: number,
  lang?: string
): GeneratedQuestion[] {
  const isTechnical = category.toLowerCase().includes('technical') || category.toLowerCase().includes('programming');
  const isHR = category.toLowerCase().includes('hr') || category.toLowerCase().includes('behavioral');

  let pool: GeneratedQuestion[] = [];

  if (isHR) {
    pool = [
      {
        question_text: 'Tell me about yourself, your academic journey, and what drove your interest in becoming a ' + role + '.',
        category: 'Introduction & Trajectory',
        rationale: 'Establishes personal background, communication cadence, and alignment with engineering goals.',
      },
      {
        question_text: 'Can you walk me through a complex collaborative project where you encountered a significant conflict or deadline setback? How did you resolve it?',
        category: 'Teamwork & Conflict Resolution',
        rationale: 'Examines behavioral maturity, STAR methodology, and adaptability under pressure.',
      },
      {
        question_text: 'Describe an instance where you received critical or negative feedback on your work. How did you react and what tangible changes followed?',
        category: 'Receptiveness & Growth Mindset',
        rationale: 'Measures continuous learning and resilience.',
      },
      {
        question_text: 'Where do you envision your technical and career growth over the next 3 to 5 years, and what specific engineering competencies are you prioritizing?',
        category: 'Career Vision',
        rationale: 'Assesses ambition, self-direction, and career intentionality.',
      },
      {
        question_text: 'How do you prioritize competing deadlines between urgent bugs, refactoring technical debt, and shipping new user features?',
        category: 'Priority Management',
        rationale: 'Evaluates pragmatic task prioritization and communication with product managers.',
      },
    ];
  } else {
    // Technical questions
    if (role.toLowerCase().includes('frontend') || role.toLowerCase().includes('full stack')) {
      pool = [
        {
          question_text: 'Explain how the browser renders a web page from HTML parsing to compositing, and how you optimize Core Web Vitals like LCP and CLS.',
          category: 'Browser Internals & Performance',
          rationale: 'Verifies foundational understanding of the DOM, CSSOM, layout engine, and paint performance.',
        },
        {
          question_text: `In modern ${lang || 'TypeScript/JavaScript'}, how do you manage asynchronous operations, prevent race conditions in data fetching, and handle memory leaks in long-lived client sessions?`,
          category: 'Async Programming & Memory',
          rationale: 'Evaluates hands-on async patterns, abort controllers, and heap allocation hygiene.',
        },
        {
          question_text: 'Describe how you design a resilient state management architecture across modular micro-frontends or complex multi-step forms.',
          category: 'State Architecture',
          rationale: 'Assesses scalable frontend design patterns and data immutability.',
        },
        {
          question_text: 'How do you safeguard client-side applications against Cross-Site Scripting (XSS), CSRF, and third-party script vulnerabilities?',
          category: 'Web Security',
          rationale: 'Tests security awareness in modern web development.',
        },
        {
          question_text: 'Walk me through how you would architect a real-time collaborative feature (like shared cursor or live comments) using WebSockets and optimistic UI updates.',
          category: 'Real-Time Architecture',
          rationale: 'Tests end-to-end full stack mechanics and conflict resolution.',
        },
      ];
    } else if (role.toLowerCase().includes('data') || role.toLowerCase().includes('ai') || role.toLowerCase().includes('ml')) {
      pool = [
        {
          question_text: 'Explain the trade-offs between precision, recall, and F1-score when evaluating an imbalanced classification dataset.',
          category: 'Statistical Modeling & Metrics',
          rationale: 'Evaluates mathematical grounding and practical metric selection.',
        },
        {
          question_text: 'How do you detect and mitigate data drift and concept drift in a production machine learning pipeline?',
          category: 'MLOps & Pipeline Stability',
          rationale: 'Tests production operations experience beyond offline training.',
        },
        {
          question_text: 'Describe your approach to feature engineering and missing value imputation when working with high-dimensional time-series data.',
          category: 'Data Preprocessing',
          rationale: 'Assesses exploratory data analysis and feature hygiene.',
        },
        {
          question_text: 'How would you architect a vector search and Retrieval-Augmented Generation (RAG) system with low latency and high context relevance?',
          category: 'LLM & Semantic Search Architecture',
          rationale: 'Evaluates modern generative AI and embedding pipeline capabilities.',
        },
      ];
    } else {
      pool = [
        {
          question_text: `Explain how you would design a RESTful or GraphQL API for high-volume transactions, including idempotency keys and rate limiting.`,
          category: 'API & Systems Design',
          rationale: 'Verifies backend design rigor and defensive coding.',
        },
        {
          question_text: 'How do you analyze and optimize slow database queries? Discuss indexing strategies, execution plans, and transaction isolation levels.',
          category: 'Database Optimization',
          rationale: 'Evaluates deep database engineering competency.',
        },
        {
          question_text: 'Describe how you handle distributed logging, distributed tracing, and fault-tolerant retries across microservices.',
          category: 'Observability & Resilience',
          rationale: 'Assesses enterprise reliability engineering experience.',
        },
        {
          question_text: 'What strategies do you employ for continuous integration, automated canary deployments, and zero-downtime database migrations?',
          category: 'DevOps & Deployment',
          rationale: 'Tests release engineering best practices.',
        },
      ];
    }
  }

  return pool.slice(0, count);
}

/**
 * Intelligent heuristic evaluation fallback
 */
function calculateHeuristicEvaluation(
  role: string,
  category: string,
  questions: Array<{ index: number; text: string; category?: string }>,
  answers: Array<{ index: number; text: string; mode: string; duration?: number }>
): GeneratedEvaluation {
  let totalLength = 0;
  let answeredCount = 0;

  const question_feedback: QuestionFeedbackResult[] = questions.map(q => {
    const ans = answers.find(a => a.index === q.index);
    const ansText = ans?.text?.trim() || '';
    const words = ansText.split(/\s+/).filter(Boolean).length;
    
    let score = 50;
    let strengths = 'Provided a direct attempt at addressing the core inquiry.';
    let improvements = 'Deepen technical specificity and outline quantitative trade-offs.';
    let missingPoints = ['Architectural trade-off analysis', 'Concrete production metrics'];

    if (words > 80) {
      score = 88;
      strengths = 'Thorough, structured explanation with great context and relevant terminology.';
      improvements = 'Can refine pacing to summarize executive takeaways earlier.';
    } else if (words > 40) {
      score = 78;
      strengths = 'Clear answer with good foundational logic.';
      improvements = 'Incorporate real-world production examples and edge cases.';
    } else if (words > 10) {
      score = 65;
      strengths = 'Briefly touched on primary keywords.';
      improvements = 'Elaborate more fully; single-sentence answers do not showcase your depth.';
    } else {
      score = 40;
      strengths = 'Attempted question.';
      improvements = 'Answer was insufficient or missing substantive detail.';
    }

    if (words > 0) {
      totalLength += words;
      answeredCount++;
    }

    return {
      questionIndex: q.index,
      question: q.text,
      answer: ansText || '(No answer provided)',
      score,
      strengths,
      improvements,
      missingPoints,
      idealAnswer: `When addressing ${q.text.slice(0, 50)}..., state the underlying architectural objective, contrast 2-3 trade-offs with specific technologies, and close with a verifiable metric or production outcome.`,
    };
  });

  const avgQuestionScore = Math.round(
    question_feedback.reduce((sum, item) => sum + item.score, 0) / (question_feedback.length || 1)
  );

  return {
    overall_score: avgQuestionScore,
    technical_score: Math.min(95, Math.max(50, avgQuestionScore + 2)),
    relevance_score: Math.min(95, Math.max(50, avgQuestionScore)),
    communication_score: Math.min(95, Math.max(50, avgQuestionScore - 1)),
    problem_solving_score: Math.min(95, Math.max(50, avgQuestionScore + 1)),
    language_score: Math.min(95, Math.max(50, avgQuestionScore + 3)),
    confidence_score: Math.min(95, Math.max(50, avgQuestionScore - 2)),
    strengths: [
      `Demonstrated consistent foundational understanding for ${role}.`,
      'Answered questions systematically with coherent professional terminology.',
      'Showcased clear interest in building scalable, production-grade systems.',
    ],
    weaknesses: [
      'Could incorporate more quantitative data points (e.g. latency numbers, throughput metrics).',
      'Ensure every complex technical answer explicitly contrasts two alternative solutions.',
    ],
    missing_points: [
      'Edge-case failure modes and circuit-breaker patterns.',
      'Automated testing coverage strategies (integration vs unit tests).',
    ],
    question_feedback,
    improvement_suggestions: [
      'Structure behavioral answers strictly around Situation, Task, Action, and Measurable Result.',
      'When asked a technical design question, begin by clarifying constraints and non-functional requirements.',
      'Practice speaking aloud at a measured 130-150 words per minute to maximize clarity.',
    ],
    recommended_topics: [
      'System Architecture: Distributed Caching & Event-Driven Patterns',
      'Database Query Profiling & Index Selection Rules',
      'Behavioral Storytelling: STAR Executive Communication',
    ],
  };
}
