/** Builds a minimal "Add to calendar" .ics data URI for a YAN event with a confirmed date. */
export function buildIcsDataUri({
  title,
  description,
  startsAt,
  endsAt,
  venueName,
}: {
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  venueName: string | null;
}): string {
  const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = endsAt ?? new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YAN Atlanta//Events//EN",
    "BEGIN:VEVENT",
    `UID:${format(startsAt)}-yan@lwnetwork.org`,
    `DTSTAMP:${format(new Date(startsAt))}`,
    `DTSTART:${format(startsAt)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    ...(venueName ? [`LOCATION:${venueName.replace(/\n/g, " ")}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
