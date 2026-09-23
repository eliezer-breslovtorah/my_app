import CategoryClient from "./CategoryClient";

export function generateStaticParams() {
  return [{ category: "nach" }, { category: "default" }];
}

export default function Page() {
  return <CategoryClient />;
}

