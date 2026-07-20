export default function SectionHeading({
  children,
  accentWord,
}: {
  children: string;
  accentWord?: string;
}) {
  if (!accentWord) {
    return <h2 className="text-4xl md:text-5xl font-bold">{children}</h2>;
  }
  const parts = children.split(accentWord);
  return (
    <h2 className="text-4xl md:text-5xl font-bold">
      {parts[0]}
      <span className="text-[var(--accent-blue)]">{accentWord}</span>
      {parts[1]}
    </h2>
  );
}