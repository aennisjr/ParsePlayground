import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import DelayedSections from "@/components/dynamic/DelayedSections";
import { DATASETS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Delayed rendering",
  description: "Content that appears and changes on timers after the page loads.",
  alternates: { canonical: "/dynamic/delayed" },
};

export default function DelayedPage() {
  const units = DATASETS.products.reduce((s, p) => s + p.inventory, 0);
  const remote = DATASETS.jobs.filter((j) => j.remote === "Remote").length;
  const rentals = DATASETS["real-estate"].filter((p) => p.listingType === "rent").length;
  const stats = [
    { key: "inventory", label: "Units in stock", value: units.toLocaleString("en-US") },
    { key: "remote-jobs", label: "Remote jobs", value: String(remote) },
    { key: "rentals", label: "Homes to rent", value: String(rentals) },
  ];
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dynamic content", href: "/dynamic" }, { label: "Delayed rendering", href: "/dynamic/delayed" }]} />
      <h1 className="h3">Delayed rendering</h1>
      <p className="text-body-secondary col-lg-8">
        Everything below is rendered by JavaScript on timers that start when the page loads. Reload to start again. The
        expected values are: <strong>{stats.map((s) => `${s.label.toLowerCase()} ${s.value}`).join(", ")}</strong>; a final price of{" "}
        <strong>$199.99</strong>; and a status of <strong>ready</strong>.
      </p>
      <DelayedSections stats={stats} />
    </div>
  );
}
