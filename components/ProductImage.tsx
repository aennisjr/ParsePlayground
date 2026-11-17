/**
 * Placeholder product image: a category-coloured panel. No image files means
 * nothing to host or license; the alt text still describes the product.
 */
const HUES: Record<string, number> = {
  Laptops: 210, Smartphones: 260, Audio: 330, Wearables: 160, Cameras: 25, Home: 190, Gaming: 285, Accessories: 45,
};
const ICONS: Record<string, string> = {
  Laptops: "💻", Smartphones: "📱", Audio: "🎧", Wearables: "⌚", Cameras: "📷", Home: "🏠", Gaming: "🎮", Accessories: "🔌",
};

export default function ProductImage({ name, category, large = false }: { name: string; category: string; large?: boolean }) {
  const hue = HUES[category] ?? 200;
  return (
    <div
      role="img"
      aria-label={name}
      className="product-image d-flex align-items-center justify-content-center"
      style={{
        aspectRatio: large ? "4 / 3" : "1 / 1",
        background: `linear-gradient(135deg, hsl(${hue} 70% 92%), hsl(${hue} 55% 80%))`,
        fontSize: large ? "6rem" : "3.25rem",
      }}
    >
      <span aria-hidden="true">{ICONS[category] ?? "📦"}</span>
    </div>
  );
}
