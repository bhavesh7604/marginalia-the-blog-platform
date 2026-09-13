export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-serif text-3xl text-ink">{title}</h1>
      <p className="mt-2 font-sans text-sm text-ink-faint">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
