import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

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
    return null; // letter still renders without the logo if the file can't be read
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#222222",
  },
  header: {
    backgroundColor: NAVY,
    paddingVertical: 24,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: { backgroundColor: "#FFFFFF", borderRadius: 6, padding: 4, marginRight: 10 },
  logo: { width: 30, height: 30 },
  orgName: { color: "#FFFFFF", fontSize: 15, fontFamily: "Helvetica-Bold" },
  orgTagline: { color: "#7CCBE6", fontSize: 8, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerRightText: { color: "#FFFFFF", fontSize: 8, opacity: 0.75 },
  copperRule: { height: 3, backgroundColor: COPPER },
  body: { paddingHorizontal: 48, paddingTop: 32, paddingBottom: 24, flexGrow: 1 },
  date: { fontSize: 10, color: SLATE, marginBottom: 20 },
  greeting: { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 14 },
  paragraph: { fontSize: 10.5, lineHeight: 1.6, color: "#333333", marginBottom: 12, textAlign: "left" },
  detailsBox: {
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: MIST,
    borderRadius: 6,
    padding: 16,
  },
  detailsTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: COPPER, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  detailsLabel: { fontSize: 9.5, color: SLATE },
  detailsValue: { fontSize: 9.5, color: NAVY, fontFamily: "Helvetica-Bold" },
  irsBox: {
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: COPPER,
    paddingLeft: 12,
  },
  irsText: { fontSize: 8.5, color: SLATE, lineHeight: 1.5 },
  signatureBlock: { marginTop: 10 },
  signatureClosing: { fontSize: 10.5, color: "#333333", marginBottom: 22 },
  signatureName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY },
  signatureTitle: { fontSize: 9.5, color: SLATE, marginTop: 2 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: MIST,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  footerText: { fontSize: 7.5, color: "#8A97A3", lineHeight: 1.4, textAlign: "center" },
});

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function frequencyLabel(frequency: string): string {
  if (frequency === "monthly") return "Monthly recurring gift";
  if (frequency === "yearly") return "Annual recurring gift";
  return "One-time gift";
}

export type DonationLetterData = {
  name: string;
  amount: number; // cents
  frequency: string;
  date: Date;
};

export function DonationThankYouLetter({ name, amount, frequency, date }: DonationLetterData) {
  const logo = getLogoDataUri();
  const donorName = name?.trim() || "Friend";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Letterhead */}
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
          <View style={styles.headerRight}>
            <Text style={styles.headerRightText}>lwnetwork.org</Text>
            <Text style={styles.headerRightText}>ofandino@lwnetwork.org</Text>
          </View>
        </View>
        <View style={styles.copperRule} />

        <View style={styles.body}>
          <Text style={styles.date}>{formatDate(date)}</Text>

          <Text style={styles.greeting}>Dear {donorName},</Text>

          <Text style={styles.paragraph}>
            I wanted to take a moment, personally, to say thank you. Gifts like yours are what make it
            possible for Living Water Network to keep doing the work of forming Kingdom leaders — leaders who
            are not just trained, but truly formed, before they are sent out to lead others.
          </Text>

          <Text style={styles.paragraph}>
            Every leader who walks through our nine-month Groundwork journey does so because someone like you
            believed it was worth funding. Your generosity doesn&apos;t just support a program line item — it
            shapes a real person&apos;s character, calling, and capacity to lead well. That is not a small
            thing, and I don&apos;t take it for granted.
          </Text>

          <Text style={styles.paragraph}>
            Thank you for trusting us with a part of what God has entrusted to you. It is a privilege to
            partner with you in this.
          </Text>

          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Your Gift</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Date of gift</Text>
              <Text style={styles.detailsValue}>{formatDate(date)}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Amount</Text>
              <Text style={styles.detailsValue}>{formatAmount(amount)}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Type</Text>
              <Text style={styles.detailsValue}>{frequencyLabel(frequency)}</Text>
            </View>
          </View>

          <View style={styles.irsBox}>
            <Text style={styles.irsText}>
              Living Water Network Inc. is a tax-exempt organization under Section 501(c)(3) of the Internal
              Revenue Code (EIN 93-1859873). No goods or services were provided in exchange for this
              contribution. This letter serves as your official record of this gift for tax purposes — please
              retain it for your records.
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureClosing}>With gratitude,</Text>
            <Text style={styles.signatureName}>Omar J. Fandino</Text>
            <Text style={styles.signatureTitle}>Founder, Living Water Network</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Living Water Network Inc. · A Georgia 501(c)(3) nonprofit organization · EIN 93-1859873
          </Text>
          <Text style={styles.footerText}>
            Your donation is tax-deductible to the extent allowed by law. Please retain this letter for your
            tax records.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
