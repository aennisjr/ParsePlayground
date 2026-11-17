import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FetchProductSearch from "@/components/dynamic/FetchProductSearch";
import { taxonomy } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fetch API search",
  description: "Search-as-you-type powered by debounced fetch() requests.",
  alternates: { canonical: "/dynamic/fetch" },
};

export default function FetchPage() {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dynamic content", href: "/dynamic" }, { label: "Fetch API", href: "/dynamic/fetch" }]} />
      <h1 className="h3">Fetch API: live product search</h1>
      <p className="text-body-secondary col-lg-8">
        Results update as you type. Each change waits 300 ms, then calls <code>/api/products</code> with <code>fetch()</code>;
        the server takes about 700 ms to respond. If you type again before a response arrives, the old request is cancelled.
        Check your script by searching <strong>speaker</strong> in <strong>Audio</strong> — the summary should read{" "}
        <em>5 matching products</em>.
      </p>
      <div className="col-lg-8">
        <FetchProductSearch categories={taxonomy.productCategories} delayMs={700} />
      </div>
    </div>
  );
}
