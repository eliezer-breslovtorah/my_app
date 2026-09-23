export function makeLessonSlug(text: string) {
  return text
    .replace(/\.mp3$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
