/**
 * YAN icon mark — an original SVG built for this build, NOT the official supplied
 * logo (no production logo/icon files were provided with this project). It
 * interprets the "node network" language described in the brand guidelines
 * (points of light / connections across a city) so the site has a coherent
 * mark to ship with. Swap this file's contents for the real asset when
 * Living Water Network provides one — nothing else should need to change,
 * since every consumer imports <YanMark /> rather than an <img>.
 */
type YanMarkVariant = "navy" | "white" | "blue-outline";

const NODES = [
  { cx: 32, cy: 8, r: 4.2, top: true },
  { cx: 12, cy: 22, r: 3.2 },
  { cx: 52, cy: 22, r: 3.2 },
  { cx: 20, cy: 42, r: 3.6 },
  { cx: 44, cy: 42, r: 3.6 },
  { cx: 32, cy: 56, r: 4.6 },
] as const;

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [1, 4],
  [2, 3],
  [3, 5],
  [4, 5],
];

export function YanMark({
  variant = "navy",
  size = 40,
  className,
}: {
  variant?: YanMarkVariant;
  size?: number;
  className?: string;
}) {
  const lineColor =
    variant === "white" ? "rgba(255,255,255,0.45)" : variant === "blue-outline" ? "rgba(255,255,255,0.55)" : "rgba(37,99,235,0.35)";
  const nodeColor = variant === "white" ? "#FFFFFF" : variant === "blue-outline" ? "#FFFFFF" : "#2563EB";
  const topNodeColor = variant === "navy" ? "#0B1120" : nodeColor;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].cx}
          y1={NODES[a].cy}
          x2={NODES[b].cx}
          y2={NODES[b].cy}
          stroke={lineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
      {NODES.map((node, i) => {
        const isTop = "top" in node && node.top;
        return (
          <circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={isTop ? topNodeColor : nodeColor}
            stroke={variant === "blue-outline" && isTop ? "#FFFFFF" : "none"}
            strokeWidth={isTop ? 2 : 0}
          />
        );
      })}
    </svg>
  );
}
