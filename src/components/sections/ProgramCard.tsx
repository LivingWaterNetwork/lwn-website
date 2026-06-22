interface ProgramCardProps {
  title: string;
  description: string;
  icon: string;
}

export function ProgramCard({ title, description, icon }: ProgramCardProps) {
  return (
    <div className="card flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-serif font-semibold text-teal text-xl">{title}</h3>
      <p className="text-charcoal/70 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
