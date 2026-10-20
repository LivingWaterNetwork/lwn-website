import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { renderMarkdownToPdfBlocks } from "./markdownToPdf";

const NAVY = "#0A2A47";
const COPPER = "#C05A12";
const SLATE = "#445563";
const MIST = "#EAF1F6";

let cachedLogoDataUri: string | null = null;
function getLogoDataUri(): string | null {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo-mark.png");
    const buffer = fs.readFileSync(logoPath);
    cachedLogoDataUri = `data:image/png;base64,${buffer.toString("base64")}`;
    return cachedLogoDataUri;
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  page: { paddingBottom: 48, fontFamily: "Helvetica", fontSize: 9.5, color: "#222222" },
  header: {
    backgroundColor: NAVY,
    paddingVertical: 18,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoBox: { backgroundColor: "#FFFFFF", borderRadius: 6, padding: 4, marginRight: 10 },
  logo: { width: 26, height: 26 },
  orgName: { color: "#FFFFFF", fontSize: 13, fontFamily: "Helvetica-Bold" },
  orgTagline: { color: "#7CCBE6", fontSize: 7.5, marginTop: 2 },
  copperRule: { height: 3, backgroundColor: COPPER },
  body: { paddingHorizontal: 48, paddingTop: 22 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: MIST,
    paddingHorizontal: 48,
    paddingVertical: 10,
  },
  footerText: { fontSize: 7, color: "#8A97A3", textAlign: "center" },
  watermark: {
    position: "absolute",
    top: 320,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 54,
    fontFamily: "Helvetica-Bold",
    color: "#C8392B",
    opacity: 0.16,
    transform: "rotate(-30deg)",
  },
  sigPageTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 14 },
  sigCard: { borderWidth: 1, borderColor: "#D7DEE4", borderRadius: 6, padding: 14, marginBottom: 14 },
  sigRoleLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: COPPER, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  sigLabel: { fontSize: 9, color: SLATE },
  sigValue: { fontSize: 9, color: NAVY, fontFamily: "Helvetica-Bold" },
  sigImage: { width: 160, height: 50, marginTop: 8, objectFit: "contain" },
  sigUnsigned: { fontSize: 9, color: "#A94442", fontStyle: "italic", marginTop: 4 },
  certLabel: { fontSize: 9, color: SLATE, width: 150 },
  certRow: { flexDirection: "row", marginBottom: 4 },
  certValue: { fontSize: 9, color: "#222222", flex: 1 },
  eventRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#EDEFF2", paddingVertical: 4 },
  eventCell: { fontSize: 7.5, color: "#333333", flex: 1 },
});

function formatUtc(d: Date | null | undefined): string {
  if (!d) return "—";
  return `${d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC")}`;
}

export type AgreementPdfSigner = {
  role: string;
  label: string;
  name: string;
  title?: string | null;
  status: string;
  signedAt?: Date | null;
  typedName?: string | null;
  signatureImage?: string | null;
  consentVersion?: string | null;
};

export type AgreementPdfEvent = {
  type: string;
  actorRole?: string | null;
  createdAt: Date;
  ip?: string | null;
  userAgent?: string | null;
};

export type AgreementPdfProps = {
  kind: "draft" | "participant_signed" | "executed";
  agreementId: string;
  contentSha256: string;
  templateKey: string;
  templateVersion: string;
  title: string;
  filledMarkdown: string;
  signers: AgreementPdfSigner[];
  events: AgreementPdfEvent[];
};

const WATERMARK_TEXT: Record<AgreementPdfProps["kind"], string> = {
  draft: "DRAFT",
  participant_signed: "AWAITING LWN\nCOUNTERSIGNATURE",
  executed: "FULLY EXECUTED",
};

function Watermark({ kind }: { kind: AgreementPdfProps["kind"] }) {
  return (
    <Text style={styles.watermark} fixed>
      {WATERMARK_TEXT[kind]}
    </Text>
  );
}

function Footer({ agreementId, contentSha256 }: { agreementId: string; contentSha256: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}  ·  Agreement ${agreementId}  ·  ${contentSha256.slice(0, 16)}  ·  Living Water Network Inc. · Confidential`
        }
      />
    </View>
  );
}

function BrandHeader() {
  const logo = getLogoDataUri();
  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {logo && (
            <View style={styles.logoBox}>
              <Image src={logo} style={styles.logo} />
            </View>
          )}
          <View>
            <Text style={styles.orgName}>Living Water Network</Text>
            <Text style={styles.orgTagline}>Rooted in truth. Sent to lead.</Text>
          </View>
        </View>
      </View>
      <View style={styles.copperRule} />
    </>
  );
}

export function AgreementPdf({
  kind,
  agreementId,
  contentSha256,
  templateKey,
  templateVersion,
  filledMarkdown,
  signers,
  events,
}: AgreementPdfProps) {
  const blocks = renderMarkdownToPdfBlocks(filledMarkdown);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Watermark kind={kind} />
        <BrandHeader />
        <View style={styles.body}>{blocks}</View>
        <Footer agreementId={agreementId} contentSha256={contentSha256} />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Watermark kind={kind} />
        <BrandHeader />
        <View style={styles.body}>
          <Text style={styles.sigPageTitle}>Signature Page</Text>
          {signers.map((signer, i) => (
            <View key={i} style={styles.sigCard} wrap={false}>
              <Text style={styles.sigRoleLabel}>{signer.label}</Text>
              <View style={styles.sigRow}>
                <Text style={styles.sigLabel}>Name</Text>
                <Text style={styles.sigValue}>{signer.name}</Text>
              </View>
              {signer.title && (
                <View style={styles.sigRow}>
                  <Text style={styles.sigLabel}>Title</Text>
                  <Text style={styles.sigValue}>{signer.title}</Text>
                </View>
              )}
              {signer.status === "signed" ? (
                <>
                  <View style={styles.sigRow}>
                    <Text style={styles.sigLabel}>Typed signature</Text>
                    <Text style={styles.sigValue}>{signer.typedName}</Text>
                  </View>
                  <View style={styles.sigRow}>
                    <Text style={styles.sigLabel}>Signed (UTC)</Text>
                    <Text style={styles.sigValue}>{formatUtc(signer.signedAt)}</Text>
                  </View>
                  {signer.signatureImage && <Image src={signer.signatureImage} style={styles.sigImage} />}
                </>
              ) : (
                <Text style={styles.sigUnsigned}>Not yet signed.</Text>
              )}
            </View>
          ))}
        </View>
        <Footer agreementId={agreementId} contentSha256={contentSha256} />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Watermark kind={kind} />
        <BrandHeader />
        <View style={styles.body}>
          <Text style={styles.sigPageTitle}>Audit Certificate</Text>

          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Agreement ID</Text>
            <Text style={styles.certValue}>{agreementId}</Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Template</Text>
            <Text style={styles.certValue}>{templateKey} v{templateVersion}</Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Content SHA-256</Text>
            <Text style={styles.certValue}>{contentSha256}</Text>
          </View>
          {signers
            .filter((s) => s.consentVersion)
            .map((s, i) => (
              <View style={styles.certRow} key={i}>
                <Text style={styles.certLabel}>{s.label} consent version</Text>
                <Text style={styles.certValue}>{s.consentVersion}</Text>
              </View>
            ))}

          <Text style={[styles.sigRoleLabel, { marginTop: 16, marginBottom: 6 }]}>Event Log</Text>
          <View style={styles.eventRow}>
            <Text style={[styles.eventCell, { fontFamily: "Helvetica-Bold" }]}>Event</Text>
            <Text style={[styles.eventCell, { fontFamily: "Helvetica-Bold" }]}>Actor</Text>
            <Text style={[styles.eventCell, { fontFamily: "Helvetica-Bold", flex: 1.6 }]}>Time (UTC)</Text>
            <Text style={[styles.eventCell, { fontFamily: "Helvetica-Bold" }]}>IP</Text>
          </View>
          {events.map((e, i) => (
            <View style={styles.eventRow} key={i} wrap={false}>
              <Text style={styles.eventCell}>{e.type}</Text>
              <Text style={styles.eventCell}>{e.actorRole ?? "—"}</Text>
              <Text style={[styles.eventCell, { flex: 1.6 }]}>{formatUtc(e.createdAt)}</Text>
              <Text style={styles.eventCell}>{e.ip ?? "—"}</Text>
            </View>
          ))}
        </View>
        <Footer agreementId={agreementId} contentSha256={contentSha256} />
      </Page>
    </Document>
  );
}
