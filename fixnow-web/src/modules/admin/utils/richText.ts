const allowedTags = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'DIV', 'EM', 'FONT', 'H2', 'H3', 'H4',
  'I', 'LI', 'OL', 'P', 'SPAN', 'STRONG', 'U', 'UL',
])

const allowedStyles = new Set([
  'color',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'text-align',
  'text-decoration',
])
const blockedTags = new Set(['EMBED', 'IFRAME', 'OBJECT', 'SCRIPT', 'STYLE'])

export function sanitizeRichText(value: string) {
  if (typeof window === 'undefined') return ''
  const documentValue = new DOMParser().parseFromString(value, 'text/html')

  const clean = (element: Element) => {
    Array.from(element.children).forEach((child) => {
      if (blockedTags.has(child.tagName)) {
        child.remove()
        return
      }
      if (!allowedTags.has(child.tagName)) {
        clean(child)
        child.replaceWith(...Array.from(child.childNodes))
        return
      }

      Array.from(child.attributes).forEach((attribute) => {
        if (child.tagName === 'A' && attribute.name === 'href') {
          if (!/^(https?:|mailto:|tel:|\/|#)/i.test(attribute.value)) child.removeAttribute(attribute.name)
          return
        }
        if (child.tagName === 'A' && ['target', 'rel'].includes(attribute.name)) return
        if (attribute.name === 'style') {
          const styles = attribute.value
            .split(';')
            .map((item) => item.trim())
            .filter(Boolean)
            .filter((item) => allowedStyles.has(item.split(':')[0]?.trim().toLowerCase()))
          if (styles.length) child.setAttribute('style', styles.join('; '))
          else child.removeAttribute('style')
          return
        }
        if (child.tagName === 'FONT' && ['color', 'face', 'size'].includes(attribute.name)) return
        child.removeAttribute(attribute.name)
      })

      if (child.tagName === 'A') {
        child.setAttribute('target', '_blank')
        child.setAttribute('rel', 'noopener noreferrer')
      }
      clean(child)
    })
  }

  clean(documentValue.body)
  return documentValue.body.innerHTML
}

export function hasRichTextContent(value: string) {
  if (typeof window === 'undefined') return value.replace(/<[^>]*>/g, '').trim().length > 0
  return new DOMParser().parseFromString(value, 'text/html').body.textContent?.trim().length !== 0
}

export function normalizeRichText(value: string) {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return value
  return value
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!)}</p>`)
    .join('')
}
