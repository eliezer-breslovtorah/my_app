"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../firebase";

type AudioItem = {
  filename: string;
  url: string;
  series: string;
  title: string;
  isClip: boolean;
};

function getSeries(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.includes("yehoshua")) return "Yehoshua";
  if (lower.includes("shoftim")) return "Shoftim";

  return "Other";
}

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
  return text.toLowerCase().replace(/\s+/g, "-");
}

export default function Home() {
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudioFiles() {
      try {
        const rootRef = ref(storage);
        const result = await listAll(rootRef);

        const mp3Files = result.items.filter((item) =>
          item.name.toLowerCase().endsWith(".mp3")
        );

        const items = await Promise.all(
          mp3Files.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);

            return {
              filename: itemRef.name,
              url,
              series: getSeries(itemRef.name),
              title: makeTitle(itemRef.name),
              isClip: itemRef.name
                .toLowerCase()
                .includes("clip"),
            };
          })
        );

        setAudioItems(items);
      } catch (error) {
        console.error("Error loading Firebase files:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAudioFiles();
  }, []);

  const featuredLessons = audioItems.slice(0, 4);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f3ef",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      {/* HEADER */}
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
            <a href="#featured">Featured</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "65px 25px",
          }}
        >
          <div
            style={{
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#777",
                marginBottom: "15px",
              }}
            >
              Torah Audio Library
            </div>

            <h1
              style={{
                fontSize: "52px",
                lineHeight: "1.1",
                margin: "0 0 20px",
              }}
            >
              Explore Torah Lessons and Short Clips
            </h1>

            <p
              style={{
                fontSize: "20px",
                lineHeight: "1.6",
                color: "#555",
                margin: 0,
              }}
            >
              Listen to full lessons and selected short clips
              from our growing Breslov Torah audio library.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "50px 25px 80px",
        }}
      >
        {/* TOPICS */}
        <section
          style={{
            marginBottom: "65px",
          }}
        >
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#777",
                marginBottom: "8px",
              }}
            >
              Browse
            </div>

            <h2
              style={{
                fontSize: "34px",
                margin: 0,
              }}
            >
              Topics to Explore
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            <Link
              href="/category/nach"
              style={{
                background: "#ffffff",
                border: "1px solid #ddd",
                padding: "32px",
                minHeight: "170px",
                textDecoration: "none",
                color: "#222",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#777",
                    marginBottom: "10px",
                  }}
                >
                  Torah
                </div>

                <h3
                  style={{
                    fontSize: "28px",
                    margin: 0,
                  }}
                >
                  Nach
                </h3>

                <p
                  style={{
                    color: "#666",
                    lineHeight: "1.5",
                    marginTop: "12px",
                  }}
                >
                  Yehoshua, Shoftim, and other books of Nach.
                </p>
              </div>

              <div
                style={{
                  marginTop: "25px",
                  fontSize: "15px",
                }}
              >
                Explore Nach →
              </div>
            </Link>
          </div>
        </section>

        {/* FEATURED LESSONS */}
        <section id="featured">
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#777",
                marginBottom: "8px",
              }}
            >
              Listen
            </div>

            <h2
              style={{
                fontSize: "34px",
                margin: 0,
              }}
            >
              Featured Lessons
            </h2>
          </div>

          {loading && <p>Loading lessons...</p>}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "22px",
            }}
          >
            {featuredLessons.map((lesson) => (
              <article
                key={lesson.filename}
                style={{
                  background: "#ffffff",
                  border: "1px solid #ddd",
                  padding: "28px",
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
                  {lesson.isClip
                    ? "Short Clip"
                    : "Full Lesson"}
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    lineHeight: "1.35",
                    margin: "0 0 20px",
                  }}
                >
                  {lesson.title}
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
                    marginTop: "18px",
                  }}
                >
                  <Link
                    href={`/series/${makeSlug(
                      lesson.series
                    )}`}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    View {lesson.series} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}