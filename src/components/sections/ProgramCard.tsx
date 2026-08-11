import Link from "next/link";

interface ProgramCardProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
}

export function ProgramCard({ title, description, icon, href }: ProgramCardProps) {
  const content = (
    <div className="card flex flex-col gap-4 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="text-3xl group-hover:scale-110 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <h3 className="font-serif font-semibold text-navy text-xl">{title}</h3>
      <p className="text-slate text-sm leading-relaxed font-sans flex-1">{description}</p>
      {href && (
        <span className="text-xs font-semibold font-sans text-copper group-hover:text-copper-dark inline-flex items-center gap-1">
          Learn more
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
