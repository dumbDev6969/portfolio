import { CommentEyebrow, WindowCard, SectionHeading } from '../theme';
import {
  SiReact,
  SiTailwindcss,
  SiLaravel,
  SiPhp,
  SiMysql,
  SiSqlite,
  SiGit,
  SiGithub,
  SiLivewire,
} from 'react-icons/si';

export default function About() {
  return (
    <>
    <section id="about" className="px-6 py-16 max-w-6xl w-full mx-auto border-t border-[var(--border-subtle)]">
      {/* Top Part: About Intro & WindowCard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: About Intro */}
        <div className="lg:col-span-7 flex flex-col">
          <CommentEyebrow>Hello, I'm</CommentEyebrow>
          <SectionHeading>About me</SectionHeading>
          <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed font-sans max-w-xl">
            I'm a full-stack developer who likes turning messy problems into clean, working products.
            Based in the Philippines, currently deep in React and Laravel, always chasing the next
            thing worth learning.
          </p>
        </div>

        {/* Right: WindowCard Code Block */}
        <div className="lg:col-span-5 w-full">
          <WindowCard label="about.ts">
            <div className="leading-relaxed select-none text-[13px] md:text-sm">
              {/* Line 1: const about = { */}
              <div>
                <span className="text-[var(--syntax-keyword)]">const</span>{' '}
                <span className="text-[var(--syntax-key)]">about</span>{' '}
                <span className="text-[var(--text-primary)]">=</span>{' '}
                <span className="text-yellow-500 font-bold">{'{'}</span>
              </div>

              {/* Line 2: name: "Joshua Cabuang", */}
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">name</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">"Joshua Cabuang"</span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>

              {/* Line 3: role: "Full-Stack Developer", */}
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">role</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">"Full-Stack Developer"</span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>

              {/* Line 4: location: "Philippines", */}
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">location</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">"Philippines"</span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>

              {/* Line 5: status: "Open to opportunities", */}
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">status</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">"Open to opportunities"</span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>

              {/* Line 6: code: "Clean, Simple, Efficient", */}
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">code</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">"Clean, Simple, Efficient"</span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>

              {/* Line 7: focus: ["web dev", "problem solving"], */}
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">focus</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-yellow-500 font-bold">[</span>
                <span className="text-[var(--syntax-string)]">"web dev"</span>
                <span className="text-[var(--text-secondary)]">, </span>
                <span className="text-[var(--syntax-string)]">"problem solving"</span>
                <span className="text-yellow-500 font-bold">]</span>
              </div>

              {/* Line 8: }; */}
              <div>
                <span className="text-yellow-500 font-bold">{'}'}</span>
                <span className="text-[var(--text-secondary)]">;</span>
              </div>

              <div className="h-4" />

              {/* Line 9: export default developer; */}
              <div>
                <span className="text-[var(--syntax-keyword)]">export</span>{' '}
                <span className="text-[var(--syntax-keyword)]">default</span>{' '}
                <span className="text-[var(--text-primary)]">developer</span>
                <span className="text-[var(--text-secondary)]">;</span>
              </div>
            </div>
          </WindowCard>
        </div>
      </div>

      {/* Middle Part: Tech Stack Section */}
      <div className="mt-20">
        <CommentEyebrow>Tech Stack</CommentEyebrow>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-6">
          {/* Frontend */}
          <div>
            <h3 className="font-sans font-bold text-xs text-[var(--text-primary)] mb-4 uppercase tracking-widest select-none">
              Frontend
            </h3>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center gap-2.5 select-none">
                <SiReact className="text-[#61dafb] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">React</span>
              </li>
              <li className="flex items-center gap-2.5 select-none">
                <SiTailwindcss className="text-[#06b6d4] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">Tailwind CSS</span>
              </li>
            </ul>
          </div>

          {/* Backend */}
          <div>
            <h3 className="font-sans font-bold text-xs text-[var(--text-primary)] mb-4 uppercase tracking-widest select-none">
              Backend
            </h3>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center gap-2.5 select-none">
                <SiLaravel className="text-[#ff2d20] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">Laravel</span>
              </li>
              <li className="flex items-center gap-2.5 select-none">
                <SiPhp className="text-[#777bb4] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">PHP</span>
              </li>
            </ul>
          </div>

          {/* Database and tools */}
          <div>
            <h3 className="font-sans font-bold text-xs text-[var(--text-primary)] mb-4 uppercase tracking-widest select-none">
              Database and tools
            </h3>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center gap-2.5 select-none">
                <SiMysql className="text-[#00758f] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">MySQL</span>
              </li>
              <li className="flex items-center gap-2.5 select-none">
                <SiSqlite className="text-[#003b57] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">SQLite</span>
              </li>
              <li className="flex items-center gap-2.5 select-none">
                <SiGit className="text-[#f05032] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">Git</span>
              </li>
              <li className="flex items-center gap-2.5 select-none">
                <SiGithub className="text-[var(--text-primary)] text-lg shrink-0 animate-pulse-slow" />
                <span className="text-[var(--text-secondary)]">GitHub</span>
              </li>
            </ul>
          </div>

          {/* Full stack */}
          <div>
            <h3 className="font-sans font-bold text-xs text-[var(--text-primary)] mb-4 uppercase tracking-widest select-none">
              Full stack
            </h3>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center gap-2.5 select-none">
                <SiLivewire className="text-[#fb70a9] text-lg shrink-0" />
                <span className="text-[var(--text-secondary)]">Livewire</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Part: What I do & Timeline Section */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-[var(--border-subtle)]">
        {/* Capabilities (What I do) */}
        <div className="lg:col-span-8 flex flex-col">
          <CommentEyebrow>What I do</CommentEyebrow>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {/* Capability 1 */}
            <div className="md:pr-6 md:border-r border-[var(--border-subtle)]">
              <h4 className="font-sans font-bold text-base text-[var(--text-primary)] mb-3 leading-snug">
                Full-Stack<br />Development
              </h4>
              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                Building an end-to-end web applications using modern tools and best practices
              </p>
            </div>

            {/* Capability 2 */}
            <div className="md:px-6 md:border-r border-[var(--border-subtle)]">
              <h4 className="font-sans font-bold text-base text-[var(--text-primary)] mb-3 leading-snug">
                UI/UX Focused
              </h4>
              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                Creating clean, responsive, and intuitive interface.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="md:pl-6">
              <h4 className="font-sans font-bold text-base text-[var(--text-primary)] mb-3 leading-snug">
                Problem solving
              </h4>
              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                Creating clean, responsive, and intuitive interface.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-4 flex flex-col pl-0 lg:pl-8">
          <div className="relative border-l border-[var(--border-subtle)] ml-2 pl-6 space-y-8 py-2">
            {/* Timeline Item 1 */}
            <div className="relative">
              {/* Dot */}
              <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border border-[var(--border-subtle)]" />
              <div className="font-mono text-[10px] text-[var(--text-secondary)] mb-1 select-none">
                2024-present
              </div>
              <h5 className="font-sans font-bold text-xs text-orange-400 mb-1 select-none">
                Started my journey
              </h5>
              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                Building projects and leveling up my skills everyday.
              </p>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              {/* Dot */}
              <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border border-[var(--border-subtle)]" />
              <div className="font-mono text-[10px] text-[var(--text-secondary)] mb-1 select-none">
                2023-2024
              </div>
              <h5 className="font-sans font-bold text-xs text-[var(--syntax-keyword)] mb-1 select-none">
                Exploring and improving
              </h5>
              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                Explored many technologies, build practice projects and discovered my passion in backend.
              </p>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative">
              {/* Dot */}
              <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border border-[var(--border-subtle)]" />
              <div className="font-mono text-[10px] text-[var(--text-secondary)] mb-1 select-none">
                2022-2023
              </div>
              <h5 className="font-sans font-bold text-xs text-[var(--accent-blue)] mb-1 select-none">
                Started my journey
              </h5>
              <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                Begin learning web development and fell inlove with coding and problem silving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Certificates anchor — activates 'certificates' nav item on scroll */}
    <div id="certificates" className="w-full" />
    </>
  );
}
