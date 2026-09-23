import SeriesClient from "./SeriesClient";

export function generateStaticParams() {
  return [{ series: "yehoshua" }, { series: "shoftim" }, { series: "other" }];
}

export default function Page() {
  return <SeriesClient />;
}

