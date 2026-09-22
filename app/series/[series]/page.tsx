"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../../../firebase";

type AudioItem = {
  filename: string;
  url: string;
  title: string;
  isClip: boolean;
};

function makeTitle(filename: string) {
  let title = filename
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

function makeSlug(text: string) {
  return text
    .replace(/\.mp3$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SeriesPage() {
  const params = useParams();

  const series =
    typeof params.series === "string"
      ? params.series.toLowerCase()
      : "";

  const displayName =
    series.charAt(0).toUpperCase() + series.slice(1);

  const [lessons, setLessons] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      try {
        const rootRef = ref(storage);
        const result = await listAll(rootRef);

        const matchingFiles = result.items.filter((item) => {
          const name = item.name.toLowerCase();

          return (
            name.endsWith(".mp3") &&
            name.includes(series)
          );
        });

        const loadedLessons = await Promise.all(
          matchingFiles.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);

            return {
              filename: itemRef.name,
              url,
              title: makeTitle(itemRef.name),
              isClip: itemRef.name
                .toLowerCase()
                .includes("clip"),
            };
          })
        );

        setLessons(loadedLessons);
      } catch (error) {
        console.error("Error loading lessons:", error);
      } finally {
        setLoading(false);
      }
    }

    if (series) {
      loadLessons();
    }
  }, [series]);

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
            gap: "30px",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#222",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              BRESLOV TORAH
            </div>
          </Link>

          <nav
            style={{
              display: "flex",
              gap: "28px",
              fontSize: "15px",
            }}
          >
            <Link href="/">Home</Link>
            <Link href="/category/nach">Nach</Link>
          </nav>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          padding: "35px 25px 70px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            marginBottom: "35px",
            color: "#666",
          }}
        >
          <Link href="/">Home</Link>
          <span> &nbsp;›&nbsp; </span>
          <Link href="/category/nach">Nach</Link>
          <span> &nbsp;›&nbsp; </span>
          <strong>{displayName}</strong>
        </div>

        <section
          style={{
            background: "#ffffff",
            padding: "45px",
            marginBottom: "35px",
            borderTop: "5px solid #333",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "12px",
              color: "#777",
            }}
          >
            Nach
          </div>

          <h1
            style={{
              fontSize: "44px",
              margin: "0 0 15px",
            }}
          >
            {displayName}
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#555",
              margin: 0,
            }}
          >
            Explore our audio lessons and short clips from
            Sefer {displayName}.
          </p>
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              margin: 0,
            }}
          >
            Lessons
          </h2>

          {!loading && (
            <span style={{ color: "#777" }}>
              {lessons.length}{" "}
              {lessons.length === 1 ? "lesson" : "lessons"}
            </span>
          )}
        </div>

        {loading && <p>Loading lessons...</p>}

        {!loading && lessons.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              padding: "30px",
            }}
          >
            No lessons found for {displayName}.
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {lessons.map((lesson, index) => (
            <article
              key={lesson.filename}
              style={{
                background: "#ffffff",
                padding: "28px 32px",
                border: "1px solid #e1e1e1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "25px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    minWidth: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "#333",
                    color: "#ffffff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "7px",
                      color: "#777",
                    }}
                  >
                    {lesson.isClip
                      ? "Short Clip"
                      : "Full Lesson"}
                  </div>

                  <h3
                    style={{
                      fontSize: "22px",
                      margin: "0 0 18px",
                    }}
                  >
                    <Link
                      href={`/lesson/${makeSlug(
                        lesson.filename
                      )}`}
                      style={{
                        textDecoration: "none",
                        color: "#222",
                        cursor: "pointer",
                      }}
                    >
                      {lesson.title}
                    </Link>
                  </h3>

                  <audio
                    controls
                    preload="metadata"
                    style={{
                      width: "100%",
                    }}
                  >
                    <source
                      src={lesson.url}
                      type="audio/mpeg"
                    />
                  </audio>

                  <div
                    style={{
                      marginTop: "14px",
                    }}
                  >
                    <Link
                      href={`/lesson/${makeSlug(
                        lesson.filename
                      )}`}
                      style={{
                        textDecoration: "none",
                        fontSize: "14px",
                      }}
                    >
                      View full lesson page →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}