import { normalizeRichText, sanitizeRichText } from '../utils/richText'

export function SafeRichText({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`rich-text-content ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(normalizeRichText(html)) }} />
}
