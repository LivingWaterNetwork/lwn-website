import { notFound } from "next/navigation";
import { getYanAdminModel } from "@/lib/yanAdminSchema";
import { YanAdminModelClient } from "@/components/yan/admin/YanAdminModelClient";

export default function YanAdminModelPage({ params }: { params: { model: string } }) {
  if (!getYanAdminModel(params.model)) notFound();
  return <YanAdminModelClient modelKey={params.model} />;
}
