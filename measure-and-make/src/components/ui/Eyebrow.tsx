export function Eyebrow({
  children,
  tone = "dark",
}: {
  children: string;
  tone?: "dark" | "light";
}) {
  return (
    <p className={`eyebrow ${tone === "light" ? "text-sage" : "text-field"}`}>
      {children}
    </p>
  );
}
