export type Recording = {
  filename: string;
  path: string;
  title: string;
  book: string;
  lesson: string;
  isClip: boolean;
  teacher?: string;
  duration?: number;
};

function bookFromName(filename: string) {
  const book = filename.match(/^n\d+(?:clip(?:-?\d+)?)?-(.+?)-lesson-/i)?.[1];
  return book?.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function makeRecordings(files: { name: string; fullPath: string }[]): Recording[] {
  const mp3s = files.filter((file) => /\.mp3$/i.test(file.name));
  const books = new Map<string, string>();
  for (const file of mp3s) {
    const number = file.name.match(/^n(\d+)/i)?.[1];
    const book = bookFromName(file.name);
    if (number && book && !/clip/i.test(file.name)) books.set(number, book);
  }
  return mp3s.map((file) => {
    const number = file.name.match(/^n(\d+)/i)?.[1];
    const book = bookFromName(file.name) ?? books.get(number ?? "") ?? "Other";
    const lesson = file.name.match(/-lesson-(\d+[a-z]?)(?:-|\.)/i)?.[1];
    const cleaned = file.name.replace(/\.mp3$/i, "")
      .replace(/^n\d+(?:clip(?:-?\d+)?)?-/i, "")
      .replace(/-(?:esv\d*|v\d+|edu)(?:-.*)?$/i, "");
    const topic = cleaned.replace(/^.+?-lesson-\d+[a-z]?(?:-|$)/i, "");
    const title = (topic || `${book} lesson ${lesson ?? ""}`).replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
    return { filename: file.name, path: file.fullPath, title, book,
      lesson: lesson ? `Lesson ${lesson}` : "", isClip: /clip/i.test(file.name) };
  }).sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
}

export function matchesRecording(item: Recording, query: string, book: string, type: string, teacher: string) {
  const haystack = [item.title, item.filename, item.book, item.lesson, item.teacher ?? ""].join(" ").toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).every((word) => haystack.includes(word))
    && (!book || item.book === book)
    && (!type || (type === "clips" ? item.isClip : !item.isClip))
    && (!teacher || item.teacher === teacher);
}

export function formatDuration(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  return hours
    ? `${hours}:${String(Math.floor(total / 60) % 60).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
    : `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
