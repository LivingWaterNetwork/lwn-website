/**
 * YAN icon mark — a code-drawn reproduction of the official triangle/node
 * mark (public/images/yan/brand/yan-icon-mark.png), used wherever the mark
 * needs a specific line color that the flat PNG can't provide (e.g. white
 * connecting lines on a dark background). For the full horizontal/stacked
 * lockups, see YanLogo.tsx, which renders the official supplied artwork
 * directly.
 */
type YanMarkVariant = "navy" | "white";

const NODES = [
  { cx: 32, cy: 11, r: 7.5, color: "#2563EB" },
  { cx: 11, cy: 50, r: 7.5, color: "#C49A6C" },
  { cx: 53, cy: 50, r: 7.5, color: "#5A755E" },
] as const;

export function YanMark({
  variant = "navy",
  size = 40,
  className,
}: {
  variant?: YanMarkVariant;
  size?: number;
  className?: string;
}) {
  const lineColor = variant === "white" ? "#FFFFFF" : "#0B1120";

  return (
    <svg
      viewBox="0 0 64 60"
      width={size}
      height={(size * 60) / 64}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={`M${NODES[0].cx} ${NODES[0].cy} L${NODES[1].cx} ${NODES[1].cy} M${NODES[0].cx} ${NODES[0].cy} L${NODES[2].cx} ${NODES[2].cy} M${NODES[1].cx} ${NODES[1].cy} L${NODES[2].cx} ${NODES[2].cy}`}
        stroke={lineColor}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {NODES.map((node, i) => (
        <circle key={i} cx={node.cx} cy={node.cy} r={node.r} fill={node.color} />
      ))}
    </svg>
  );
}
