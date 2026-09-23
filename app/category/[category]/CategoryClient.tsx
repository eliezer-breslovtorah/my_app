"use client";

import { useEffect, useMemo, useState } from "react";
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
  series: string;
  title: string;
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

function makeSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export default function CategoryPage() {
  const params = useParams();

  const category =
    typeof params.category === "string"
      ? params.category.toLowerCase()
      : "";

  const displayName =
    category.charAt(0).toUpperCase() + category.slice(1);

  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
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
            };
          })
        );

        setAudioItems(items);
      } catch (error) {
        console.error("Error loading category:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  const seriesList = useMemo(() => {
    if (category !== "nach") return [];

    return Array.from(
      new Set(audioItems.map((item) => item.series))
    ).filter((series) => series !== "Other");
  }, [audioItems, category]);

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
          background: "#fff",
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
          </nav>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1080px",
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
          <strong>{displayName}</strong>
        </div>

        <section
          style={{
            background: "#fff",
            padding: "45px",
            marginBottom: "40px",
            borderTop: "5px solid #333",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#777",
              marginBottom: "10px",
            }}
          >
            Category
          </div>

          <h1
            style={{
              fontSize: "46px",
              margin: "0 0 15px",
            }}
          >
            {displayName}
          </h1>

          <p
            style={{
              fontSize: "19px",
              lineHeight: "1.6",
              color: "#555",
              margin: 0,
            }}
          >
            Explore books and series in {displayName}.
          </p>
        </section>

        <h2
          style={{
            fontSize: "30px",
            marginBottom: "22px",
          }}
        >
          Books and Series
        </h2>

        {loading && <p>Loading...</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {seriesList.map((series) => (
            <Link
              key={series}
              href={`/series/${makeSlug(series)}`}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                padding: "32px",
                minHeight: "150px",
                textDecoration: "none",
                color: "#222",
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
                {displayName}
              </div>

              <h3
                style={{
                  fontSize: "26px",
                  margin: 0,
                }}
              >
                {series}
              </h3>

              <div style={{ marginTop: "25px" }}>
                View lessons →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
