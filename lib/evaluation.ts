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
    label: "Not at all",
    description: "That never really happened.",
  },
  {
    value: "2",
    label: "Mostly not",
    description: "One or two exceptions, but it was rare.",
  },
  {
    value: "3",
    label: "It varied",
    description: "Sometimes yes, sometimes no — I'm not sure.",
  },
  {
    value: "4",
    label: "Mostly yes",
    description: "It worked well, with room to improve.",
  },
  {
    value: "5",
    label: "Consistently",
    description: "This was true every time.",
  },
  {
    value: "na",
    label: "I can't say",
    description: "I didn't see enough of this to judge.",
  },
];

export const FREQUENCY_OPTIONS: EvaluationOption[] = [
  {
    value: "every",
    label: "Every session",
    description: "They were there each time we were scheduled.",
  },
  {
    value: "most",
    label: "Most sessions",
    description: "One or two were missed or moved.",
  },
  {
    value: "half",
    label: "About half the time",
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
    description: "No scheduled sessions took place.",
  },
  {
    value: "na",
    label: "No classes to judge",
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
      return "Did the mix of on-campus and online teaching work for the way you joined this unit?";
    case "data-mining":
      return "Did the long Monday 8:30 AM – 1:00 PM block still feel useful all the way through?";
    case "logic-programming":
      return "Did Lab 2 have the machines, software and space you needed for the practicals?";
    case "business-english":
      return "Was the Auditorium a good place to learn in — could you hear and take part?";
    case "remote-sensing":
      return "Were the room, equipment and class size workable for this unit?";
    case "computability":
      return "Did the mix of lecturer explanation and student presentations help you learn?";
    default:
      return "Did the learning conditions help you do your best in this unit?";
  }
}

export function buildQuestions(course: Course): EvaluationQuestion[] {
  return [
    {
      id: "outline",
      kind: "scale",
      prompt: `At the start of the semester, did ${course.lecturer} explain what the unit covered and how you would be assessed?`,
      hint: "Think back to week one. Did what was shared match what actually happened?",
      options: SCALE_OPTIONS,
    },
    {
      id: "attendance",
      kind: "frequency",
      prompt: `How often did ${course.lecturer} show up for the ${attendanceAnchor(course)} classes?`,
      hint: "Think about the whole semester, not just one good or bad week.",
      options: FREQUENCY_OPTIONS,
    },
    {
      id: "delivery",
      kind: "scale",
      prompt: "When a topic was new to you, did the teaching help it click — or was it mostly notes and slides?",
      hint: "Think about the explanations, examples or practical work that made the difference.",
      options: SCALE_OPTIONS,
    },
    {
      id: "assessment",
      kind: "scale",
      prompt: "Did the tests and assignments feel fair, and did they draw on what you were actually taught?",
      hint: "Could you prepare for them from the lectures and practicals?",
      options: SCALE_OPTIONS,
    },
    {
      id: "feedback",
      kind: "scale",
      prompt: "Did marked work come back in time, with comments you could actually use before the exams?",
      hint: "No marked work in this unit? Choose \"I can't say\".",
      options: SCALE_OPTIONS,
    },
    {
      id: "environment",
      kind: "scale",
      prompt: environmentQuestion(course),
      hint: `This one is about ${course.venue} and the conditions you learned in.`,
      options: SCALE_OPTIONS,
    },
    {
      id: "comment",
      kind: "text",
      prompt: "What else should the QA office know about this unit?",
      hint: "Optional — this is where the detail behind your ratings belongs.",
      optional: true,
      placeholder: "Tell us in your own words what worked, what didn't, and what should change.",
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
