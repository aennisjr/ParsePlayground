import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import AjaxJobsTable from "@/components/dynamic/AjaxJobsTable";

export const metadata: Metadata = {
  title: "AJAX loading",
  description: "A jobs table loaded with XMLHttpRequest after the page loads.",
  alternates: { canonical: "/dynamic/ajax" },
};

export default function AjaxPage() {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dynamic content", href: "/dynamic" }, { label: "AJAX", href: "/dynamic/ajax" }]} />
      <h1 className="h3">AJAX: jobs by top of salary range</h1>
      <p className="text-body-secondary col-lg-8">
        This table is filled by an <code>XMLHttpRequest</code> about 1.5 seconds after the page loads. Fetch this page with a
        plain HTTP client and you&apos;ll only find the &ldquo;Loading jobs…&rdquo; row. When loaded, it has{" "}
        <strong>15 rows</strong> and the table&apos;s <code>data-state</code> attribute is <code>loaded</code>. Rows are sorted by the number at the top of each salary range, whatever its currency.
      </p>
      <AjaxJobsTable delayMs={1500} />
    </div>
  );
}
