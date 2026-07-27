import { SITE_OWNER_NAME } from '../../data/contact';

type SiteFooterProps = {
  ownerName?: string;
};

export default function SiteFooter({ ownerName = SITE_OWNER_NAME }: SiteFooterProps) {
  return (
    <footer className="px-6 py-6 border-t border-[var(--border-subtle)] text-center">
      <p className="font-mono text-xs text-[var(--text-secondary)]">
        © {new Date().getFullYear()} {ownerName}. All rights reserved.
      </p>
    </footer>
  );
}
