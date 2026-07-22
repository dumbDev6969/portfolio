applyTo: "src//*.tsx,src//.ts,src/**/.css"
Portfolio Design System — "Code Editor" Theme
This portfolio's identity is: the content IS the code. Every section presents real content (bio, projects, contact info) formatted as if it were a literal JS/TS object being displayed inside a code editor window. Do not deviate into generic card/hero patterns — everything routes through this metaphor.
Design Tokens
Define these as CSS variables in index.css / globals.css. Never hardcode hex values in components — always reference the token.
:root {
  /* Backgrounds */
  --bg-page: #0a0a0a;         /* page background, near-black */
  --bg-card: #161616;         /* window/card surface, one step lighter */
  --bg-card-inset: #1c1c1c;   /* nested surfaces (e.g. input fields) */
  --border-subtle: #2a2a2a;

  /* Traffic lights (macOS window chrome) — fixed, do not theme these */
  --dot-red: #ff5f56;
  --dot-yellow: #ffbd2e;
  --dot-green: #27c93f;

  /* Text */
  --text-primary: #f5f5f5;
  --text-secondary: #a1a1aa;
  --text-comment: #6a9955;    /* "// eyebrow" labels — VS Code comment green */

  /* Syntax accent palette — used inside code-styled content blocks */
  --syntax-keyword: #c586c0;  /* const, export, default */
  --syntax-string: #ce9178;   /* string literal values */
  --syntax-key: #9cdcfe;      /* object property names */
  --syntax-link: #3b82f6;     /* clickable links, also primary CTA */
  --syntax-number: #b5cea8;

  /* Primary accent (buttons, active nav, highlights) */
  --accent-blue: #3b82f6;
  --accent-blue-hover: #2563eb;

  /* Fonts */
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

Install fonts via Google Fonts or @fontsource/jetbrains-mono + @fontsource/inter. Do not substitute a different monospace font without checking it has similar letter-spacing — Fira Code / JetBrains Mono are both fine, Courier/Menlo are not (too narrow, breaks the code-block rhythm).
Core Reusable Components
Build these once in src/components/theme/ and compose every section from them. Do not inline one-off versions inside page components.
1. <WindowCard> — the signature container
Every distinct block of content (bio card, project card, contact form, code snippet) lives inside this. Rounded corners (rounded-lg/12px), --bg-card background, --border-subtle 1px border, and a top strip with three traffic-light dots (left-aligned, 12px diameter, 8px gap).
type WindowCardProps = {
  children: React.ReactNode;
  label?: string; // optional filename shown top-right, e.g. "contact-info.json"
};

function WindowCard({ children, label }: WindowCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--dot-red)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--dot-yellow)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--dot-green)]" />
        </div>
        {label && (
          <span className="font-mono text-xs text-[var(--text-secondary)]">{label}</span>
        )}
      </div>
      <div className="p-5 font-mono text-sm">{children}</div>
    </div>
  );
}

2. <CommentEyebrow> — section label
Small, monospace, --text-comment color, always prefixed with //. Sits above every section heading, no exceptions (see all 5 mockups — "Hello, I'm", "My stack", "Let's connect" all follow this).
function CommentEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-sm text-[var(--text-comment)] mb-2">
      // {children}
    </p>
  );
}

3. <SectionHeading> — big bold title
Large sans-serif (--font-sans), bold, --text-primary. Supports a two-tone variant where one word gets --accent-blue (e.g. "Full-stack Developer" in the hero).
function SectionHeading({
  children,
  accentWord,
}: {
  children: string;
  accentWord?: string;
}) {
  if (!accentWord) {
    return <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">{children}</h2>;
  }
  const parts = children.split(accentWord);
  return (
    <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
      {parts[0]}
      <span className="text-[var(--accent-blue)]">{accentWord}</span>
      {parts[1]}
    </h2>
  );
}

4. <CodeButton> — primary/secondary CTA
Prefixed with >_ (literal terminal-prompt style, matches "▸_View my works", "▸_Hire me", "▸_Send Message" in the mockups). Primary = filled --accent-blue; secondary = outline only.
function CodeButton({
  children,
  variant = "primary",
  onClick,
}: {
  children: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}) {
  const base = "font-mono text-sm px-4 py-2 rounded-md transition-colors";
  const styles =
    variant === "primary"
      ? "bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)]"
      : "border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-blue)]";
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      &gt;_{children}
    </button>
  );
}

5. Object-literal content blocks
This is the theme's signature move — bio/project/contact data is displayed as literal syntax-highlighted JS, not laid out as a normal paragraph or list. Build a small internal syntax component rather than hand-coloring spans every time:
function CodeKV({ k, v }: { k: string; v: string | string[] }) {
  const rendered = Array.isArray(v)
    ? `[${v.map((s) => `'${s}'`).join(", ")}]`
    : `"${v}"`;
  return (
    <div>
      <span style={{ color: "var(--syntax-key)" }}>{k}</span>
      <span className="text-[var(--text-secondary)]">: </span>
      <span style={{ color: "var(--syntax-string)" }}>{rendered}</span>
      <span className="text-[var(--text-secondary)]">,</span>
    </div>
  );
}

Use inside a WindowCard, wrapped with literal const developer = { ... }; and export default developer; lines styled with --syntax-keyword.
6. Orbiting tech-stack icons
Central hub icon (JS) with orbit rings; stack icons (React, PHP, MySQL, Tailwind, Laravel/Livewire) positioned around it via CSS transform: rotate() + translate(), each counter-rotated so the icon glyph itself stays upright. Use react-icons/si (Simple Icons set) for crisp, themeable SVGs — never raster/PNG logos.
@keyframes orbit {
  from { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
}
.orbit-icon {
  animation: orbit 24s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .orbit-icon { animation: none; }
}

Keep the duration between 20-30s — fast rotation reads as a spinner/loading state, which undercuts the "ambient" effect you want.
Navbar Pattern
Left: "Joshua." as plain bold text (not code-styled). Right: nav links rendered literally as a JS array — const nav = ['home', 'about', 'projects', 'resume']; — with array syntax chars (const, =, brackets, commas) in --syntax-keyword/secondary color and each route name as a clickable --syntax-link colored string.
Layout Rhythm (apply to every section)
<CommentEyebrow>
<SectionHeading> (large, bold)
One-line supporting paragraph (--text-secondary, --font-sans, not mono)
Content (WindowCard(s), grid of ProjectCards, form, etc.)
Do not skip the eyebrow or reorder this sequence — it's the one rule every mockup follows without exception, and it's what makes the site feel designed rather than templated.
Explicitly Avoid
Generic Bootstrap/Material-style cards with drop shadows — this theme is flat, bordered, not shadowed.
Default browser font stacks — always mono for anything "code," always sans for prose/headings.
Rounded pill buttons — buttons here are rectangular-ish (rounded-md, ~6-8px), matching code-editor UI chrome, not marketing-site pill CTAs.
Bright/saturated backgrounds — the palette is near-monochrome dark + single blue accent + syntax highlight colors used sparingly, only inside code blocks.
Recommended Additional Tools for This Theme
react-icons — tech stack SVG icons (Simple Icons set)
@fontsource/jetbrains-mono + @fontsource/inter — self-hosted fonts, no external font-loading flash
Optional: react-syntax-highlighter or shiki if code blocks grow complex enough that hand-built CodeKV components become limiting — not needed for the current scope (bio/projects/contact are simple key-value shapes)
clsx — for conditionally combining the utility classes above cleanly
