import { type FormEvent, useState } from 'react';
import { CodeButton, CommentEyebrow, SectionHeading, WindowCard } from '../theme';
import { contact } from '../../data/contact';

const WEB3FORMS_ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_KEY || import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';
const CONTACT_LINKS = [
  { label: 'LinkedIn', url: contact.linkedin },
  { label: 'GitHub', url: contact.github },
  { label: 'Email', url: `mailto:${contact.email}` },
];

export default function Contact() {
  const [result, setResult] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!WEB3FORMS_ACCESS_KEY) {
      setResult('Error: Missing Web3Forms access key.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);

    setResult('Sending...');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data: { success?: boolean; message?: string } = await response.json();

      if (response.ok && data.success) {
        setResult('Success! Message sent.');
        form.reset();
        return;
      }

      const errorMessage = data.message ? `Error: ${data.message}` : 'Error: Unable to send message.';
      setResult(errorMessage);
    } catch {
      setResult('Error: Unable to send message.');
    }
  };

  return (
    <section
      id="contact"
      className="px-6 py-16 max-w-6xl w-full mx-auto border-t border-[var(--border-subtle)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6">
          <CommentEyebrow>Let&apos;s connect</CommentEyebrow>
          <SectionHeading>Contact.</SectionHeading>
          <p className="mt-4 max-w-lg text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
            Have a project in mind, or just want to say hi? I&apos;d love to hear from you.
          </p>
        </div>

        <div className="lg:col-span-6">
          <WindowCard label="contact.ts">
            <div className="text-[13px] md:text-sm leading-relaxed select-none">
              <div>
                <span className="text-[var(--syntax-keyword)]">const</span>{' '}
                <span className="text-[var(--syntax-key)]">contact</span>{' '}
                <span className="text-[var(--text-primary)]">=</span>{' '}
                <span className="text-yellow-500 font-bold">{'{'}</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">openTo</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-yellow-500 font-bold">[</span>
                <span className="text-[var(--syntax-string)]">&quot;freelance&quot;</span>
                <span className="text-[var(--text-secondary)]">, </span>
                <span className="text-[var(--syntax-string)]">&quot;full-time&quot;</span>
                <span className="text-yellow-500 font-bold">]</span>
                <span className="text-[var(--text-secondary)]">,</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">stack</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">
                  &quot;Always excited to work on meaningful projects.&quot;
                </span>
              </div>
              <div>
                <span className="text-yellow-500 font-bold">{'}'}</span>
                <span className="text-[var(--text-secondary)]">;</span>
              </div>
              <div className="mt-3">
                <span className="text-[var(--syntax-keyword)]">export</span>{' '}
                <span className="text-[var(--syntax-keyword)]">default</span>{' '}
                <span className="text-[var(--text-primary)]">contact</span>
                <span className="text-[var(--text-secondary)]">;</span>
              </div>
            </div>
          </WindowCard>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5">
          <WindowCard label="contact-info.json">
            <div className="space-y-2 text-[13px] md:text-sm leading-relaxed">
              <div>
                <span className="text-yellow-500 font-bold">{'{'}</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--syntax-key)]">connect</span>
                <span className="text-[var(--text-secondary)]">:</span>{' '}
                <span className="text-yellow-500 font-bold">[</span>
              </div>
              <div className="pl-8">
                <span className="text-yellow-500 font-bold">{'{'}</span>{' '}
                <span className="text-[var(--syntax-key)]">label</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">&quot;LinkedIn&quot;</span>
                <span className="text-[var(--text-secondary)]">, </span>
                <span className="text-[var(--syntax-key)]">url</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <a
                  href={CONTACT_LINKS[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--syntax-link)] hover:underline"
                >
                  &quot;{CONTACT_LINKS[0].url}&quot;
                </a>{' '}
                <span className="text-yellow-500 font-bold">{'}'}</span>
              </div>
              <div className="pl-8">
                <span className="text-yellow-500 font-bold">{'{'}</span>{' '}
                <span className="text-[var(--syntax-key)]">label</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">&quot;GitHub&quot;</span>
                <span className="text-[var(--text-secondary)]">, </span>
                <span className="text-[var(--syntax-key)]">url</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <a
                  href={CONTACT_LINKS[1].url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--syntax-link)] hover:underline"
                >
                  &quot;{CONTACT_LINKS[1].url}&quot;
                </a>{' '}
                <span className="text-yellow-500 font-bold">{'}'}</span>
              </div>
              <div className="pl-8">
                <span className="text-yellow-500 font-bold">{'{'}</span>{' '}
                <span className="text-[var(--syntax-key)]">label</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">&quot;Email&quot;</span>
                <span className="text-[var(--text-secondary)]">, </span>
                <span className="text-[var(--syntax-key)]">url</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <a
                  href={CONTACT_LINKS[2].url}
                  className="text-[var(--syntax-link)] hover:underline"
                >
                  &quot;{CONTACT_LINKS[2].url}&quot;
                </a>{' '}
                <span className="text-yellow-500 font-bold">{'}'}</span>
              </div>
              <div className="pl-8">
                <span className="text-yellow-500 font-bold">{'{'}</span>{' '}
                <span className="text-[var(--syntax-key)]">label</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">&quot;Location&quot;</span>
                <span className="text-[var(--text-secondary)]">, </span>
                <span className="text-[var(--syntax-key)]">value</span>
                <span className="text-[var(--text-secondary)]">: </span>
                <span className="text-[var(--syntax-string)]">&quot;Philippines&quot;</span>{' '}
                <span className="text-yellow-500 font-bold">{'}'}</span>
              </div>
              <div className="pl-4">
                <span className="text-yellow-500 font-bold">]</span>
              </div>
              <div>
                <span className="text-yellow-500 font-bold">{'}'}</span>
              </div>
            </div>
          </WindowCard>
        </div>

        <div className="lg:col-span-7">
          <WindowCard label="send-message.form">
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="hidden" name="subject" value="Portfolio Contact Form Message" />
              <input type="hidden" name="from_name" value="Portfolio Contact Form" />

              <div>
                <label htmlFor="contact-name" className="block text-xs mb-2 text-[var(--text-primary)]">
                  Your name*
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="John doe"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none focus:border-[var(--accent-blue)]"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs mb-2 text-[var(--text-primary)]">
                  Your Email*
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none focus:border-[var(--accent-blue)]"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="contact-subject" className="block text-xs mb-2 text-[var(--text-primary)]">
                  Subject*
                </label>
                <input
                  id="contact-subject"
                  name="message_subject"
                  type="text"
                  required
                  placeholder="Let&apos;s work together"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none focus:border-[var(--accent-blue)]"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="contact-message" className="block text-xs mb-2 text-[var(--text-primary)]">
                  Message*
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="I&apos;d like to collaborate on..."
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none resize-y focus:border-[var(--accent-blue)]"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <CodeButton>Send Message</CodeButton>
              </div>

              {result && (
                <p className="md:col-span-2 text-[11px] text-[var(--text-secondary)]" aria-live="polite">
                  {result}
                </p>
              )}

              {!WEB3FORMS_ACCESS_KEY && (
                <p className="md:col-span-2 text-[11px] text-[var(--text-secondary)]">
                  Set your Web3Forms access key in .env as VITE_WEB3FORMS_KEY (or
                  VITE_WEB3FORMS_ACCESS_KEY).
                </p>
              )}
            </form>
          </WindowCard>
        </div>
      </div>
    </section>
  );
}