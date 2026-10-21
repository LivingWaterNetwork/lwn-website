import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * TEMPORARY — read-only, removed once scripts/portal-migrate.ts's two FK
 * column-type assumptions (agreements.id, agreement_documents.id) are
 * confirmed against the live database. Returns only information_schema
 * metadata (column names/types) — no row data, no secrets. Do not leave
 * this in past that confirmation.
 */
export async function GET() {
  const rows = await prisma.$queryRaw<Array<{ table_name: string; column_name: string; data_type: string }>>`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE (table_name = 'agreements' AND column_name = 'id')
       OR (table_name = 'agreement_documents' AND column_name = 'id')
  `;
  return NextResponse.json({ columns: rows });
}
