import { CommentEyebrow, SectionHeading, WindowCard, CodeButton } from "../theme";
import certificatesData from "../../data/certificates.json";

type Certification = {
  title: string;
  issuer: string;
  description: string;
  earned: string;
  file: string;
};

function isCertification(value: unknown): value is Certification {
  if (typeof value !== "object" || value === null) return false;
  const cert = value as Record<string, unknown>;
  return (
    typeof cert.title === "string" &&
    typeof cert.issuer === "string" &&
    typeof cert.description === "string" &&
    typeof cert.earned === "string" &&
    typeof cert.file === "string"
  );
}

const CERTIFICATIONS: Certification[] = Array.isArray(certificatesData)
  ? certificatesData.filter(isCertification)
  : [];

export default function Certifications() {
  return (
    <section
      id="certifications"
      className="px-6 py-16 max-w-6xl w-full mx-auto border-t border-[var(--border-subtle)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <CommentEyebrow>Let&apos;s connect</CommentEyebrow>
          <SectionHeading>Certificates.</SectionHeading>
          <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed font-sans max-w-xl">
            Certifications, achievements, and recognitions that represent my
            continuous learning journey and dedication to growth.
          </p>
        </div>

        <div className="lg:col-span-5">
          <WindowCard label="certification-profile.json">
            <div className="space-y-1.5 text-[13px] md:text-sm leading-relaxed select-none">
              <div>
                <span className="text-yellow-500 font-bold">{"{"}</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">tagline</span>
                <span className="text-[var(--text-secondary)]">:</span>
              </div>
              <div className="pl-8">
                <span className="text-yellow-500 font-bold">{"{"}</span>
              </div>
              <div className="pl-12">
                <span className="text-[var(--syntax-key)]">label</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">
                  &quot;Continuous learning&quot;
                </span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>
              <div className="pl-12">
                <span className="text-[var(--syntax-key)]">text</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">
                  &quot;Always improving, always building&quot;
                </span>
              </div>
              <div className="pl-8">
                <span className="text-yellow-500 font-bold">{"}"}</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--text-secondary)]">{"}"}</span>
              </div>
              <div>
                <span className="text-yellow-500 font-bold">{"}"}</span>
              </div>
            </div>
          </WindowCard>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {CERTIFICATIONS.map((cert) => (
          <article
            key={cert.file}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)] flex flex-col h-full"
          >
            <div className="h-10 px-4 flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-card-inset)]">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--dot-red)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--dot-yellow)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--dot-green)]" />
              </div>
            </div>

            <div className="aspect-[4/3] bg-[var(--bg-card-inset)] border-b border-[var(--border-subtle)]">
              <iframe
                title={`${cert.title} preview`}
                src={`${cert.file}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full pointer-events-none"
              />
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-sans font-semibold text-sm text-[var(--text-primary)] leading-snug">
                    {cert.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">
                    {cert.issuer}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    {cert.description}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[var(--text-secondary)] shrink-0">
                  {cert.earned}
                </span>
              </div>

              <div className="mt-auto w-full pt-6">
                <CodeButton href={cert.file} target="_blank" rel="noreferrer">
                  verify
                </CodeButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
