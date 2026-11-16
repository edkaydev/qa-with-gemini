export type CourseId =
  | "embedded-systems"
  | "data-mining"
  | "logic-programming"
  | "business-english"
  | "remote-sensing"
  | "computability";

export type CourseIconName =
  | "cpu"
  | "database"
  | "braces"
  | "languages"
  | "satellite"
  | "brain";

export type Course = {
  id: CourseId;
  title: string;
  shortTitle: string;
  lecturer: string;
  day: string;
  time?: string;
  venue: string;
  icon: CourseIconName;
  tint: string;
  ink: string;
};

export const STUDENT = {
  name: "Edward",
  programme: "BSc Computer Science",
  year: "Year 3",
  semester: "Semester II",
  academicYear: "2025/2026",
};

export const COURSES: Course[] = [
  {
    id: "embedded-systems",
    title: "Embedded Systems",
    shortTitle: "Embedded Systems",
    lecturer: "Mr. David",
    day: "Monday",
    venue: "Main campus",
    icon: "cpu",
    tint: "#FFF4B2",
    ink: "#7A5A00",
  },
  {
    id: "data-mining",
    title: "Data Mining and Business Intelligence",
    shortTitle: "Data Mining & BI",
    lecturer: "Mr. Mukyaake",
    day: "Monday",
    time: "8:30 AM – 1:00 PM",
    venue: "Main campus",
    icon: "database",
    tint: "#FEE2E2",
    ink: "#A30000",
  },
  {
    id: "logic-programming",
    title: "Logic Programming",
    shortTitle: "Logic Programming",
    lecturer: "Mr. Fred",
    day: "Tuesday",
    time: "2:00 PM",
    venue: "Lab 2",
    icon: "braces",
    tint: "#F1F3F5",
    ink: "#1A1A2E",
  },
  {
    id: "business-english",
    title: "Business English",
    shortTitle: "Business English",
    lecturer: "Prof. Otaala",
    day: "Wednesday",
    time: "7:30 AM",
    venue: "Auditorium",
    icon: "languages",
    tint: "#FFF1F1",
    ink: "#CC0000",
  },
  {
    id: "remote-sensing",
    title: "Remote Sensing",
    shortTitle: "Remote Sensing",
    lecturer: "Mr. Luwaga",
    day: "Thursday",
    venue: "Main campus",
    icon: "satellite",
    tint: "#DCFCE7",
    ink: "#15803D",
  },
  {
    id: "computability",
    title: "Computability and Complexity",
    shortTitle: "Computability",
    lecturer: "Mr. Byron",
    day: "Friday",
    venue: "Main campus",
    icon: "brain",
    tint: "#DBEAFE",
    ink: "#1D4ED8",
  },
];

export function courseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}

export function courseSchedule(course: Course): string {
  return course.time ? `${course.day} · ${course.time}` : course.day;
}

export function courseContext(course: Course): string {
  return `${courseSchedule(course)} · ${course.venue}`;
}
