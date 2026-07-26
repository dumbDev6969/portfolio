type StaggeredWordHeadingProps = {
  text: string;
  accentWord?: string;
  shouldReveal: boolean;
  className?: string;
  staggerMs?: number;
};

export default function StaggeredWordHeading({
  text,
  accentWord,
  shouldReveal,
  className,
  staggerMs = 80,
}: StaggeredWordHeadingProps) {
  const words = text.trim().split(/\s+/);

  return (
    <span className={className}>
      {words.map((word, index) => {
        const isAccentWord = accentWord === word;
        const revealClass = shouldReveal ? 'hero-heading-word--reveal' : '';

        return (
          <span key={`${word}-${index}`} className="inline-block mr-[0.35em] last:mr-0">
            <span
              className={`hero-heading-word ${revealClass}${isAccentWord ? ' text-[var(--accent-blue)]' : ''}`}
              style={shouldReveal ? { animationDelay: `${index * staggerMs}ms` } : undefined}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
}
