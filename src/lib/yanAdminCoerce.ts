import type { YanAdminModelConfig } from "@/lib/yanAdminSchema";

/**
 * Coerces a raw JSON admin-form body into Prisma-ready values based on the
 * model's field config, and checks required fields are present. Fields not
 * listed in the config are dropped — the admin API can only ever write the
 * columns it knows about.
 */
export function coerceYanAdminBody(
  config: YanAdminModelConfig,
  body: Record<string, unknown>
): { data: Record<string, unknown>; error?: undefined } | { data?: undefined; error: string } {
  const data: Record<string, unknown> = {};

  for (const field of config.fields) {
    const raw = body[field.name];

    if (raw === undefined || raw === null || raw === "") {
      if (field.required) {
        return { error: `${field.label} is required.` };
      }
      if (field.type === "boolean") data[field.name] = false;
      continue;
    }

    switch (field.type) {
      case "number": {
        const num = Number(raw);
        if (!Number.isFinite(num)) return { error: `${field.label} must be a number.` };
        data[field.name] = num;
        break;
      }
      case "boolean":
        data[field.name] = raw === true || raw === "true";
        break;
      case "datetime": {
        const date = new Date(String(raw));
        if (Number.isNaN(date.getTime())) return { error: `${field.label} is not a valid date.` };
        data[field.name] = date;
        break;
      }
      default:
        data[field.name] = String(raw).trim();
    }
  }

  return { data };
}
