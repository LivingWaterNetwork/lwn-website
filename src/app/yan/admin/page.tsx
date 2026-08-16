import Link from "next/link";
import { YAN_ADMIN_MODELS } from "@/lib/yanAdminSchema";
import { AdminLogoutButton } from "@/components/yan/admin/AdminLogoutButton";

export const metadata = { title: "Admin" };

export default function YanAdminHome() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="yan-eyebrow mb-2">YAN Admin</p>
          <h1 className="yan-h2 text-white">Manage content</h1>
        </div>
        <AdminLogoutButton />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {Object.values(YAN_ADMIN_MODELS).map((model) => (
          <Link key={model.key} href={`/yan/admin/${model.key}`} className="yan-card-dark hover:bg-white/10 transition-colors">
            <h2 className="text-white font-yan-heading font-semibold text-lg">{model.pluralLabel}</h2>
            <p className="text-white/50 text-sm mt-1">Create, edit, publish, and moderate {model.label.toLowerCase()} entries.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
