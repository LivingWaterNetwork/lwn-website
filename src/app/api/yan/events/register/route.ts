import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanEventRegistrationSchema } from "@/lib/yanValidation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-event-register")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanEventRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { eventId, name, email, phone, role, organization } = parsed.data;

    const event = await prisma.yanEvent.findUnique({ where: { id: eventId }, include: { registrations: true } });
    if (!event) {
      return NextResponse.json({ error: "This event could not be found." }, { status: 404 });
    }

    const activeCount = event.registrations.filter((r) => r.status === "registered").length;
    const isFull = typeof event.capacity === "number" && activeCount >= event.capacity;

    if (isFull && !event.waitlistEnabled) {
      return NextResponse.json({ error: "This event is full and the waitlist is closed." }, { status: 409 });
    }

    const registration = await prisma.yanEventRegistration.create({
      data: {
        eventId,
        name,
        email,
        phone,
        role,
        organization,
        status: isFull ? "waitlisted" : "registered",
      },
    });

    try {
      await sendNotificationEmail({
        subject: `YAN: ${isFull ? "Waitlist" : "Registration"} — ${event.title} — ${name}`,
        text: `
New ${isFull ? "waitlist" : "registration"} for "${event.title}":

Name: ${name}
Email: ${email}
Phone: ${phone || "—"}
Role: ${role || "—"}
Organization: ${organization || "—"}
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/events/register] notification email failed:", err);
    }

    return NextResponse.json({ success: true, status: registration.status });
  } catch (err) {
    console.error("[api/yan/events/register]", err);
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }
}
