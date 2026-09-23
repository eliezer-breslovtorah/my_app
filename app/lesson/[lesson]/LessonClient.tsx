"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { makeLessonSlug } from "../../lib/lesson-slug";
import { useParams } from "next/navigation";
import {
  ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../../../firebase";
type Lesson = {
  filename: string;
  url: string;
  title: string;
  series: string;
  isClip: boolean;
};

function getSeries(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.includes("yehoshua")) return "Yehoshua";
  if (lower.includes("shoftim")) return "Shoftim";

  return "Other";
}

function makeTitle(filename: string) {
  const title = filename
    .replace(/\.mp3$/i, "")
    .replace(/^n\d+(clip-\d+)?-/i, "")
    .replace(/-esv.*$/i, "")
    .replace(/-v\d+.*$/i, "")
    .replace(/-edu$/i, "")
    .replace(/-/g, " ");

  return title.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}



export default function LessonPage() {
  const params = useParams();

  const lessonSlug =
    typeof params.lesson === "string"
      ? params.lesson
      : "";

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLesson() {
      try {
        const rootRef = ref(storage);
        const result = await listAll(rootRef);

        const matchingFile = result.items.find((item) => {
          return makeLessonSlug(item.name) === lessonSlug;
        });

        if (!matchingFile) {
          setLesson(null);
          return;
        }

        const url = await getDownloadURL(matchingFile);

        setLesson({
          filename: matchingFile.name,
          url,
          title: makeTitle(matchingFile.name),
          series: getSeries(matchingFile.name),
          isClip: matchingFile.name
            .toLowerCase()
            .includes("clip"),
        });
      } catch (error) {
        console.error("Error loading lesson:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonSlug]);

  if (loading) {
    return (
      <main style={{ padding: "40px" }}>
        <p>Loading lesson...</p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Lesson not found</h1>
        <Link href="/">← Back to Home</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f3ef",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "20px 25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#222",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            BRESLOV TORAH
          </Link>

          <nav style={{ display: "flex", gap: "28px" }}>
            <Link href="/">Home</Link>
            <Link href="/category/nach">Nach</Link>
            <Link
              href={`/series/${lesson.series.toLowerCase()}`}
            >
              {lesson.series}
            </Link>
          </nav>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "35px 25px 70px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "35px",
          }}
        >
          <Link href="/">Home</Link>
          <span> &nbsp;›&nbsp; </span>
          <Link href="/category/nach">Nach</Link>
          <span> &nbsp;›&nbsp; </span>
          <Link
            href={`/series/${lesson.series.toLowerCase()}`}
          >
            {lesson.series}
          </Link>
          <span> &nbsp;›&nbsp; </span>
          <strong>{lesson.title}</strong>
        </div>

        <article
          style={{
            background: "#ffffff",
            padding: "45px",
            borderTop: "5px solid #333",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#777",
              marginBottom: "10px",
            }}
          >
            Nach · {lesson.series} ·{" "}
            {lesson.isClip ? "Short Clip" : "Full Lesson"}
          </div>

          <h1
            style={{
              fontSize: "42px",
              lineHeight: "1.2",
              margin: "0 0 25px",
            }}
          >
            {lesson.title}
          </h1>

          <audio
            controls
            preload="metadata"
            style={{
              width: "100%",
              marginBottom: "25px",
            }}
          >
            <source
              src={lesson.url}
              type="audio/mpeg"
            />
          </audio>

          <div
            style={{
              borderTop: "1px solid #ddd",
              paddingTop: "20px",
              marginTop: "20px",
              color: "#666",
              lineHeight: "1.6",
            }}
          >
            <p>
              Series: <strong>{lesson.series}</strong>
            </p>

            <p>
              Type:{" "}
              <strong>
                {lesson.isClip
                  ? "Short Clip"
                  : "Full Lesson"}
              </strong>
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}

