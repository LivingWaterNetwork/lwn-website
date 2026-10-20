import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { marked, type Token, type Tokens } from "marked";

/**
 * Converts the agreement's frozen markdown (after system tokens are filled)
 * into @react-pdf/renderer elements. Deliberately covers only the markdown
 * features the agreement templates actually use — headings, paragraphs,
 * bold/italic/links, unordered lists, and GFM tables — rather than being a
 * general-purpose renderer.
 */

const NAVY = "#0A2A47";
const SLATE = "#445563";

type InlineRun = { text: string; bold?: boolean; italic?: boolean };

function flattenInline(tokens: Token[], bold = false, italic = false): InlineRun[] {
  const runs: InlineRun[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "strong":
        runs.push(...flattenInline((token as Tokens.Strong).tokens, true, italic));
        break;
      case "em":
        runs.push(...flattenInline((token as Tokens.Em).tokens, bold, true));
        break;
      case "link":
      case "text":
      case "codespan": {
        const text =
          "tokens" in token && (token as Tokens.Text).tokens
            ? flattenInline((token as Tokens.Text).tokens!, bold, italic)
                .map((r) => r.text)
                .join("")
            : (token as Tokens.Text | Tokens.Link | Tokens.Codespan).text;
        runs.push({ text, bold, italic });
        break;
      }
      default:
        if ("raw" in token) runs.push({ text: (token as { raw: string }).raw, bold, italic });
    }
  }
  return runs;
}

function InlineText({ tokens }: { tokens: Token[] }) {
  const runs = flattenInline(tokens);
  return (
    <Text>
      {runs.map((run, i) => (
        <Text
          key={i}
          style={{
            fontFamily: run.bold ? "Helvetica-Bold" : run.italic ? "Helvetica-Oblique" : "Helvetica",
          }}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

const blockStyles = {
  h1: { fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 14, marginBottom: 8 },
  h2: { fontSize: 12.5, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 12, marginBottom: 6 },
  h3: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 10, marginBottom: 5 },
  paragraph: { fontSize: 9.5, lineHeight: 1.5, color: "#222222", marginBottom: 7 },
  listItem: { flexDirection: "row" as const, marginBottom: 3, paddingLeft: 4 },
  bullet: { width: 12, fontSize: 9.5, color: SLATE },
  listItemText: { fontSize: 9.5, lineHeight: 1.45, color: "#222222", flex: 1 },
  table: { marginVertical: 8, borderWidth: 1, borderColor: "#D7DEE4" },
  tableRow: { flexDirection: "row" as const },
  tableHeaderCell: {
    flex: 1,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    backgroundColor: NAVY,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#D7DEE4",
  },
  tableCell: {
    flex: 1,
    fontSize: 8.5,
    color: "#222222",
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: "#D7DEE4",
    borderRightWidth: 1,
    borderRightColor: "#D7DEE4",
  },
};

export function renderMarkdownToPdfBlocks(markdown: string): React.ReactElement[] {
  const tokens = marked.lexer(markdown);
  const blocks: React.ReactElement[] = [];

  tokens.forEach((token, idx) => {
    switch (token.type) {
      case "heading": {
        const h = token as Tokens.Heading;
        const style = h.depth <= 1 ? blockStyles.h1 : h.depth === 2 ? blockStyles.h2 : blockStyles.h3;
        blocks.push(
          <Text key={idx} style={style}>
            <InlineText tokens={h.tokens} />
          </Text>
        );
        break;
      }
      case "paragraph": {
        const p = token as Tokens.Paragraph;
        blocks.push(
          <Text key={idx} style={blockStyles.paragraph}>
            <InlineText tokens={p.tokens} />
          </Text>
        );
        break;
      }
      case "list": {
        const list = token as Tokens.List;
        blocks.push(
          <View key={idx} style={{ marginBottom: 7 }}>
            {list.items.map((item, i) => (
              <View key={i} style={blockStyles.listItem}>
                <Text style={blockStyles.bullet}>{list.ordered ? `${i + 1}.` : "•"}</Text>
                <Text style={blockStyles.listItemText}>
                  <InlineText tokens={item.tokens} />
                </Text>
              </View>
            ))}
          </View>
        );
        break;
      }
      case "table": {
        const table = token as Tokens.Table;
        blocks.push(
          <View key={idx} style={blockStyles.table}>
            <View style={blockStyles.tableRow}>
              {table.header.map((cell, i) => (
                <Text key={i} style={blockStyles.tableHeaderCell}>
                  <InlineText tokens={cell.tokens} />
                </Text>
              ))}
            </View>
            {table.rows.map((row, r) => (
              <View key={r} style={blockStyles.tableRow}>
                {row.map((cell, c) => (
                  <Text key={c} style={blockStyles.tableCell}>
                    <InlineText tokens={cell.tokens} />
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
        break;
      }
      case "hr":
        blocks.push(<View key={idx} style={{ borderTopWidth: 1, borderTopColor: "#D7DEE4", marginVertical: 8 }} />);
        break;
      default:
        break; // space, html (dropped), etc.
    }
  });

  return blocks;
}
