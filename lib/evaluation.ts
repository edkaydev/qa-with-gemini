import type { Course } from "./courses";

export type QuestionKind = "scale" | "frequency" | "text";

export type EvaluationOption = {
  value: string;
  label: string;
  description: string;
};

export type EvaluationQuestion = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  hint?: string;
  options?: EvaluationOption[];
  optional?: boolean;
  placeholder?: string;
};

export const SCALE_OPTIONS: EvaluationOption[] = [
  {
    value: "1",
    label: "Strongly disagree",
    description: "This did not happen at all.",
  },
  {
    value: "2",
    label: "Disagree",
    description: "Mostly not, with a few exceptions.",
  },
  {
    value: "3",
    label: "Neutral",
    description: "Mixed, inconsistent, or unsure.",
  },
  {
    value: "4",
    label: "Agree",
    description: "Mostly yes, with room to improve.",
  },
  {
    value: "5",
    label: "Strongly agree",
    description: "This was consistently true.",
  },
  {
    value: "na",
    label: "Not applicable",
    description: "I have no basis to judge this.",
  },
];

export const FREQUENCY_OPTIONS: EvaluationOption[] = [
  {
    value: "every",
    label: "Every scheduled session",
    description: "No missed classes.",
  },
  {
    value: "most",
    label: "Most sessions",
    description: "A few were missed or rescheduled.",
  },
  {
    value: "half",
    label: "About half",
    description: "It was hit and miss.",
  },
  {
    value: "rarely",
    label: "Rarely",
    description: "Most sessions did not happen.",
  },
  {
    value: "never",
    label: "Never",
    description: "No scheduled sessions happened.",
  },
  {
    value: "na",
    label: "Not applicable",
    description: "There were no scheduled sessions to judge.",
  },
];

function attendanceAnchor(course: Course): string {
  if (course.id === "data-mining") return "Monday 8:30 AM – 1:00 PM block";
  if (course.id === "logic-programming") return "Tuesday 2:00 PM Lab 2";
  if (course.id === "business-english") return "Wednesday 7:30 AM";
  return `${course.day}`;
}

function environmentQuestion(course: Course): string {
  switch (course.id) {
    case "embedded-systems":
      return "The mix of on-campus and online delivery worked for students joining from both campuses.";
    case "data-mining":
      return "The Monday 8:30 AM – 1:00 PM block was used effectively for learning.";
    case "logic-programming":
      return "Lab 2 had the equipment and software needed for practical work.";
    case "business-english":
      return "The Auditorium was suitable for this class.";
    case "remote-sensing":
      return "The learning venue was adequate for the class size.";
    case "computability":
      return "The balance between lecturer explanation and student presentations worked for this unit.";
    default:
      return "The learning environment supported this unit well.";
  }
}

export function buildQuestions(course: Course): EvaluationQuestion[] {
  return [
    {
      id: "outline",
      kind: "scale",
      prompt: `${course.lecturer} gave us a clear course outline and assessment plan at the start of the semester.`,
      hint: "Think about week one: what was shared, and did it match what followed?",
      options: SCALE_OPTIONS,
    },
    {
      id: "attendance",
      kind: "frequency",
      prompt: `How consistently did ${course.lecturer} attend the scheduled ${attendanceAnchor(course)} sessions?`,
      hint: "Think about the whole semester, not just one week.",
      options: FREQUENCY_OPTIONS,
    },
    {
      id: "delivery",
      kind: "scale",
      prompt: "New concepts were explained clearly, with examples beyond reading notes or slides.",
      hint: "Consider the teaching you actually experienced in this unit.",
      options: SCALE_OPTIONS,
    },
    {
      id: "assessment",
      kind: "scale",
      prompt: "Tests and assignments were fair and matched what was taught.",
      hint: "Think about whether assessments reflected the syllabus and lectures.",
      options: SCALE_OPTIONS,
    },
    {
      id: "feedback",
      kind: "scale",
      prompt: "Marked work came back with feedback I could use before exams.",
      hint: "If there was no marked work, choose Not applicable.",
      options: SCALE_OPTIONS,
    },
    {
      id: "environment",
      kind: "scale",
      prompt: environmentQuestion(course),
      hint: `This is about ${course.venue} and the learning conditions for this unit.`,
      options: SCALE_OPTIONS,
    },
    {
      id: "comment",
      kind: "text",
      prompt: "Is there anything else the QA office should know about this unit?",
      hint: "Optional. Add the detail ratings cannot capture.",
      optional: true,
      placeholder: "Share anything that would help the QA office understand your experience.",
    },
  ];
}

export function answerLabel(question: EvaluationQuestion, value: string): string {
  if (!value) return "";
  if (question.kind === "text") return value;
  return question.options?.find((option) => option.value === value)?.label ?? value;
}

export function requiredAnswered(
  questions: EvaluationQuestion[],
  answers: Record<string, string>,
): boolean {
  return questions
    .filter((question) => !question.optional)
    .every((question) => Boolean(answers[question.id]?.trim()));
}

export function firstUnansweredIndex(
  questions: EvaluationQuestion[],
  answers: Record<string, string>,
): number {
  const index = questions.findIndex(
    (question) => !question.optional && !answers[question.id]?.trim(),
  );
  if (index !== -1) return index;
  const optionalIndex = questions.findIndex(
    (question) => question.optional && !answers[question.id]?.trim(),
  );
  if (optionalIndex !== -1) return optionalIndex;
  return questions.length;
}
