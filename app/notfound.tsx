import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The lesson or page you are looking for could not be found.</p>
      <Link href="/">← Back to Home</Link>
    </main>
  );
}