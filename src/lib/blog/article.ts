export interface ArticleHeading {
  id: string
  text: string
}

const UMLAUTS: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  é: 'e',
  è: 'e',
  ê: 'e',
  à: 'a',
  â: 'a',
  î: 'i',
  ô: 'o',
  û: 'u',
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/[äöüéèêàâîôû]/g, c => UMLAUTS[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function prepareArticle(html: string): {
  html: string
  headings: ArticleHeading[]
} {
  const headings: ArticleHeading[] = []
  const seen = new Set<string>()
  const prepared = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const base = slugifyHeading(text) || 'abschnitt'
    let id = base
    let n = 2
    while (seen.has(id)) {
      id = `${base}-${n}`
      n += 1
    }
    seen.add(id)
    headings.push({ id, text })
    return `<h2 id="${id}">${inner}</h2>`
  })
  return { html: prepared, headings }
}

export function readingTimeMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
