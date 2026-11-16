import { COURSES, type Course } from "./courses";

export type QaCourseRating = {
  course: string;
  lecturer: string;
  rating: number;
  basis: string;
};

export type QaStrength = {
  title: string;
  evidence: string;
};

export type QaRedFlag = {
  title: string;
  evidence: string;
  recommendation: string;
};

export type QaAction = {
  priority: "Immediate" | "This semester" | "Next semester";
  action: string;
};

export type QaReport = {
  headline: string;
  overview: string;
  overallSentiment: "Positive" | "Mixed" | "Concerned" | "Insufficient evidence";
  courseRatings: QaCourseRating[];
  strengths: QaStrength[];
  redFlags: QaRedFlag[];
  actions: QaAction[];
  generatedAt: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchCourse(courseName: string, lecturer: string): Course | undefined {
  const name = normalizeText(courseName);
  const teacher = normalizeText(lecturer);
  return COURSES.find((course) => {
    const title = normalizeText(course.title);
    const short = normalizeText(course.shortTitle);
    const teacherName = normalizeText(course.lecturer);
    return (
      title === name ||
      short === name ||
      title.includes(name) ||
      name.includes(title) ||
      short.includes(name) ||
      name.includes(short) ||
      (teacher && (teacherName === teacher || teacherName.includes(teacher) || teacher.includes(teacherName)))
    );
  });
}

function sentimentFor(ratings: QaCourseRating[]): QaReport["overallSentiment"] {
  const scored = ratings.filter((rating) => rating.rating > 0);
  if (scored.length === 0) return "Insufficient evidence";
  const average = scored.reduce((total, rating) => total + rating.rating, 0) / scored.length;
  if (average >= 3.8) return "Positive";
  if (average >= 2.6) return "Mixed";
  return "Concerned";
}

export function normalizeReport(raw: unknown): QaReport {
  const record = asRecord(raw);
  const rawRatings = asArray(record.courseRatings);
  const byCourse = new Map<string, QaCourseRating>();

  for (const item of rawRatings) {
    const rating = asRecord(item);
    const courseName = asString(rating.course);
    const lecturer = asString(rating.lecturer);
    const matched = matchCourse(courseName, lecturer);
    const key = matched?.id ?? normalizeText(courseName);
    if (!key || byCourse.has(key)) continue;
    byCourse.set(key, {
      course: matched?.title ?? courseName,
      lecturer: matched?.lecturer ?? lecturer,
      rating: Math.min(5, Math.max(0, Math.round(asNumber(rating.rating)))),
      basis: asString(rating.basis, "No basis was provided."),
    });
  }

  const courseRatings: QaCourseRating[] = COURSES.map((course) => {
    const existing = byCourse.get(course.id);
    return (
      existing ?? {
        course: course.title,
        lecturer: course.lecturer,
        rating: 0,
        basis: "Not discussed in this conversation.",
      }
    );
  });

  const rawSentiment = asString(record.overallSentiment);
  const sentiment =
    rawSentiment === "Positive" ||
    rawSentiment === "Mixed" ||
    rawSentiment === "Concerned" ||
    rawSentiment === "Insufficient evidence"
      ? rawSentiment
      : sentimentFor(courseRatings);

  const strengths = asArray(record.strengths)
    .map((item) => {
      const value = asRecord(item);
      return {
        title: asString(value.title),
        evidence: asString(value.evidence),
      };
    })
    .filter((item) => item.title || item.evidence)
    .slice(0, 6);

  const redFlags = asArray(record.redFlags)
    .map((item) => {
      const value = asRecord(item);
      return {
        title: asString(value.title),
        evidence: asString(value.evidence),
        recommendation: asString(value.recommendation),
      };
    })
    .filter((item) => item.title || item.evidence || item.recommendation)
    .slice(0, 6);

  const actions = asArray(record.actions)
    .map((item) => {
      const value = asRecord(item);
      const priority = asString(value.priority);
      return {
        priority:
          priority === "Immediate" || priority === "This semester" || priority === "Next semester"
            ? priority
            : "This semester",
        action: asString(value.action),
      } as QaAction;
    })
    .filter((item) => item.action)
    .slice(0, 8);

  return {
    headline: asString(record.headline, "Course evaluation summary"),
    overview: asString(
      record.overview,
      "The conversation produced limited evidence about the units discussed.",
    ),
    overallSentiment: sentiment,
    courseRatings,
    strengths,
    redFlags,
    actions,
    generatedAt:
      typeof record.generatedAt === "string" && record.generatedAt
        ? record.generatedAt
        : new Date().toISOString(),
  };
}

export function reportToText(report: QaReport): string {
  const lines: string[] = [];
  lines.push("QUALITY ASSURANCE SUMMARY");
  lines.push("Uganda Martyrs University");
  lines.push(`Generated ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push("");
  lines.push(report.headline);
  lines.push(report.overview);
  lines.push(`Overall sentiment: ${report.overallSentiment}`);
  lines.push("");
  lines.push("COURSE RATINGS");
  for (const rating of report.courseRatings) {
    const score = rating.rating > 0 ? `${rating.rating}/5` : "Not rated";
    lines.push(`${rating.course} — ${rating.lecturer} — ${score}`);
    lines.push(`Basis: ${rating.basis}`);
  }
  lines.push("");
  lines.push("STRENGTHS");
  if (report.strengths.length === 0) lines.push("None recorded.");
  for (const strength of report.strengths) {
    lines.push(`- ${strength.title}: ${strength.evidence}`);
  }
  lines.push("");
  lines.push("RED FLAGS");
  if (report.redFlags.length === 0) lines.push("None recorded.");
  for (const flag of report.redFlags) {
    lines.push(`- ${flag.title}: ${flag.evidence}`);
    lines.push(`  Recommended action: ${flag.recommendation}`);
  }
  lines.push("");
  lines.push("PRIORITY ACTIONS");
  if (report.actions.length === 0) lines.push("None recorded.");
  for (const action of report.actions) {
    lines.push(`- [${action.priority}] ${action.action}`);
  }
  return lines.join("\n");
}
