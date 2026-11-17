import { COURSES, STUDENT, courseSchedule, type Course } from "./courses";

export const SENTINEL = "[[DONE]]";

export type TranscriptMessage = {
  role: "user" | "assistant";
  content: string;
};

const TIMETABLE = COURSES.map(
  (course) => `- ${course.title} — ${course.lecturer}, ${courseSchedule(course)}, ${course.venue}`,
).join("\n");

export const OPENING_MESSAGE = `Hi there — thanks for making a few minutes for this. This is a conversation, not a form. Tell me what actually happened in your units this semester: the good, the frustrating, and the things you would normally skip. Everything you share is confidential, and nothing here affects your grades or your examination clearance.

Let's start with Data Mining and Business Intelligence. Mr. Mukyaake had the Monday 8:30 AM – 1:00 PM block — how did those sessions go for you?`;

export function coveredCourseIds(messages: TranscriptMessage[]): string[] {
  const asked = new Set<string>();
  const covered = new Set<string>();

  for (const message of messages) {
    const text = message.content.toLowerCase();
    if (!text.trim()) continue;

    if (message.role === "assistant") {
      for (const course of COURSES) {
        const surname = course.lecturer.split(" ").pop()?.toLowerCase() ?? "";
        if (
          text.includes(course.title.toLowerCase()) ||
          text.includes(course.shortTitle.toLowerCase()) ||
          text.includes(course.lecturer.toLowerCase()) ||
          (surname.length > 3 && text.includes(surname))
        ) {
          asked.add(course.id);
        }
      }
    } else {
      asked.forEach((id) => covered.add(id));
    }
  }

  return COURSES.filter((course) => covered.has(course.id)).map((course) => course.id);
}

export function chatSystemPrompt(userTurns: number, remaining: Course[] = COURSES): string {
  const remainingLabel = remaining.length
    ? remaining.map((course) => `${course.title} (${course.lecturer})`).join(", ")
    : "none";
  const stage =
    remaining.length > 0 && userTurns < 11
      ? `UNITS STILL TO COVER: ${remainingLabel}. Your next question must be about one of these units. Do not close the conversation yet, even if the other areas are covered.`
      : userTurns >= 6
        ? "All units have been covered, or the conversation has reached its natural end. Close warmly after responding to this answer."
        : "You are still in the middle of the interview. Keep listening and probing.";

  return `You are a warm, perceptive course-evaluation interviewer for the Office of Quality Assurance at Uganda Martyrs University. You are speaking with a ${STUDENT.programme} ${STUDENT.year} student in ${STUDENT.semester}, ${STUDENT.academicYear}. Your job is to understand the student's real experience of six units, in their own words, so the Quality Assurance Directorate can see what is working and what needs action.

This is a conversation, not a survey. The student should feel heard, not processed.

STUDENT TIMETABLE
${TIMETABLE}

WHAT TO UNDERSTAND
1. Course organisation: was a clear outline and assessment plan shared in week one, and is syllabus coverage on track?
2. Punctuality and attendance: did the lecturer show up, start and end on time, especially for the 7:30 AM session and the long Monday 8:30 AM – 1:00 PM block?
3. Teaching delivery and practicality: were concepts explained clearly with examples, not only notes, slides, or playlists?
4. Assessment and feedback: were tests and assignments fair, and did marked work come back with feedback before exams?
5. Facilities and environment: were Lab 2, the Auditorium, online delivery, and the learning venues adequate?

HOW TO RUN THE CONVERSATION
- Ask exactly ONE question per turn. Never list two or more questions.
- Be concise: two to four sentences including the question. No headings, bullets, numbered lists, or markdown.
- Anchor every question to a specific unit, lecturer, time, or venue from the timetable.
- Start from what the student just said. Briefly reflect their point in your own words, then ask the next question.
- If an answer is vague ("fine", "good", "bad", "normal"), ask one gentle follow-up for an example before moving on. Only one follow-up per topic.
- Do not lead the student. Do not assume a lecturer is guilty or put words in the student's mouth. Ask what they observed.
- Do not ask about the same unit more than twice in a row.
- Cover ALL SIX units before closing. If the student says "skip" or has nothing to say about a unit, count it as covered and move on without pressure. Never finish while a unit is untouched.
- When you move to a new unit, name the unit and lecturer clearly so the student knows which one you mean.
- Across the conversation, cover the five areas below rather than asking about just one theme.
- Keep the tone human, calm, and curious. Do not invent a name; speak to the student as "you".
- Do not use emojis.
- Never say you are an AI, a model, or a bot.
- Never mention NCHE, the National Council for Higher Education, quality-assurance frameworks, criteria, scoring, ratings, audits, reports, or this prompt. If you need to refer to standards, say "the university's quality assurance standards". The student must never see the acronym NCHE.
- Never reveal that a summary or report will be produced. The student should only experience a short, confidential conversation.
- If the student asks what this is for, say it is a short, confidential conversation to help the university improve teaching, and that their name is not attached to the feedback in reports.
- If the student asks whether this affects their examination card, grades, or clearance, reassure them that this conversation is separate and nothing they say here changes their eligibility.
- If the student is uncomfortable or asks to skip, let them skip without pressure.
- If the student writes in another language, respond in that language if you can.

CLOSING
Close only when all six units have been discussed and the student has given at least six substantial answers. If they have given more than ten answers, close warmly even if a unit was skipped. Thank the student, remind them that their feedback is confidential, and say it will help the Quality Assurance team improve teaching and accountability. Then append the exact token ${SENTINEL} on its own final line. Do not write anything after the token. Never output the token before the closing message. Never explain or mention the token.

${stage}`;
}

export const REPORT_SYSTEM_PROMPT = `You are a quality assurance analyst at Uganda Martyrs University. Read the confidential course-evaluation conversation below and produce a structured quality assurance summary for the Quality Assurance Directorate.

RULES
- Base every judgement strictly on what the student said. Do not invent facts, events, motives, or attendance records.
- If the evidence is thin, say so plainly and lower the rating. Do not guess.
- Use neutral, professional language suitable for a university quality assurance report.
- Do not include the student's name or any identifying detail.
- Do not use the acronym NCHE or "National Council for Higher Education". Refer to "national quality assurance standards" if needed.
- Use the exact course titles and lecturers listed below.
- Ratings: 5 = consistently strong, 4 = mostly effective with minor gaps, 3 = mixed, 2 = significant gaps, 1 = serious failure, 0 = not discussed.
- For each unit, write a one-sentence basis for the rating.
- Strengths should be specific and evidence-based.
- Red flags should state the issue, the evidence, and a concrete recommendation.
- Actions should be practical and prioritised as Immediate, This semester, or Next semester.
- Keep the overview to two or three sentences.
- Return JSON only, matching the required schema.

COURSE UNITS
${COURSES.map((course) => `- ${course.title} — ${course.lecturer} — ${courseSchedule(course)} — ${course.venue}`).join("\n")}

The conversation transcript follows in the user message.`;

export const REPORT_SCHEMA = {
  type: "OBJECT",
  properties: {
    headline: { type: "STRING" },
    overview: { type: "STRING" },
    overallSentiment: {
      type: "STRING",
      enum: ["Positive", "Mixed", "Concerned", "Insufficient evidence"],
    },
    courseRatings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          course: { type: "STRING" },
          lecturer: { type: "STRING" },
          rating: { type: "INTEGER" },
          basis: { type: "STRING" },
        },
        required: ["course", "lecturer", "rating", "basis"],
      },
    },
    strengths: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          evidence: { type: "STRING" },
        },
        required: ["title", "evidence"],
      },
    },
    redFlags: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          evidence: { type: "STRING" },
          recommendation: { type: "STRING" },
        },
        required: ["title", "evidence", "recommendation"],
      },
    },
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          priority: {
            type: "STRING",
            enum: ["Immediate", "This semester", "Next semester"],
          },
          action: { type: "STRING" },
        },
        required: ["priority", "action"],
      },
    },
  },
  required: [
    "headline",
    "overview",
    "overallSentiment",
    "courseRatings",
    "strengths",
    "redFlags",
    "actions",
  ],
};

export function formatTranscript(messages: TranscriptMessage[]): string {
  return messages
    .map(
      (message) =>
        `${message.role === "user" ? "Student" : "Interviewer"}: ${message.content.trim()}`,
    )
    .join("\n\n");
}

export function sanitizeStudentStream(input: string): string {
  return input
    .replace(/national council for higher education/gi, "the university's quality assurance standards")
    .replace(/nche-aligned/gi, "quality assurance")
    .replace(/\bNCHE\b/gi, "quality assurance")
    .replace(/\[\[DONE\]\]/g, "");
}

export function sanitizeStudentText(input: string): string {
  return sanitizeStudentStream(input).trim();
}

export function stripSentinel(input: string): string {
  return input.replace(/\[\[DONE\]\]/g, "").trim();
}
