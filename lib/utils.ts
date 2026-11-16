export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  const cleaned = name.replace(
    /^(prof\.?|dr\.?|mr\.?|mrs\.?|ms\.?|assoc\.?|associate professor)\s+/i,
    "",
  );
  const parts = cleaned.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}

export function estimateRemaining(questionCount: number, index: number): string {
  const remaining = Math.max(questionCount - index - 1, 0);
  if (remaining === 0) return "Last question";
  const seconds = remaining * 9;
  if (seconds < 60) return `About ${seconds} seconds left`;
  return `About ${Math.ceil(seconds / 60)} ${plural(Math.ceil(seconds / 60), "minute")} left`;
}

export function formatWeek(week: number): string {
  return `Week ${week}`;
}
