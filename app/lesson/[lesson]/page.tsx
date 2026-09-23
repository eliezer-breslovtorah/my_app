import LessonClient from "./LessonClient";
import { listAll, ref } from "firebase/storage";
import { storage } from "../../../firebase";
import { makeLessonSlug } from "../../lib/lesson-slug";

export async function generateStaticParams() {
  const result = await listAll(ref(storage));
  return result.items
    .filter((item) => /\.mp3$/i.test(item.name))
    .map((item) => ({ lesson: makeLessonSlug(item.name) }));
}

export default function Page() {
  return <LessonClient />;
}

