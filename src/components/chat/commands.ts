import { cv as CV } from '../../data/cv';

export type CommandContext = {
  clearChatHistory: () => void;
};

export type CommandHandler = (context: CommandContext) => string;

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function formatScrollResult(sectionId: string) {
  return scrollToSection(sectionId)
    ? `\`→\` scrolled to \`${sectionId}\``
    : `\`→\` section \`${sectionId}\` not found`;
}

const HELP_TEXT = [
  'Available commands:',
  '- `cd about`',
  '- `cd projects`',
  '- `cd contact`',
  '- `cd certificates`',
  '- `ls certifications`',
  '- `ls projects`',
  '- `whoami`',
  '- `open resume.pdf`',
  '- `clear`',
  '- `help`',
].join('\n');

export const commandRegistry: Record<string, CommandHandler> = {
  'cd about': () => formatScrollResult('about'),
  'cd projects': () => formatScrollResult('projects'),
  'cd contact': () => formatScrollResult('contact'),
  'cd certificates': () => {
    const isScrolled = scrollToSection('certificates') || scrollToSection('certifications');
    return isScrolled ? '`→` scrolled to `certificates`' : '`→` section `certificates` not found';
  },
  'ls certifications': () => {
    const isScrolled = scrollToSection('certifications') || scrollToSection('certificates');
    return isScrolled ? '`→` scrolled to `certifications`' : '`→` section `certifications` not found';
  },
  'ls certificates': () => {
    const isScrolled = scrollToSection('certifications') || scrollToSection('certificates');
    return isScrolled ? '`→` scrolled to `certifications`' : '`→` section `certifications` not found';
  },
  'ls projects': () => formatScrollResult('projects'),
  whoami: () => formatScrollResult('about'),
  'open resume.pdf': () => {
    window.open(CV.file, '_blank', 'noopener,noreferrer');
    return '`→` opened `resume.pdf`';
  },
  clear: (context) => {
    context.clearChatHistory();
    return '`→` cleared local chat history';
  },
  help: () => HELP_TEXT,
};
