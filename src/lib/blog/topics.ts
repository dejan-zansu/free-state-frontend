import type { AdminBlogPost } from '@/types/admin'

export type PageTopic =
  | 'storage'
  | 'heatPumps'
  | 'charging'
  | 'subsidies'
  | 'cost'
  | 'service'
  | 'repowering'

export type BlogTopic = PageTopic | 'communities' | 'tariffs' | 'obligations'

const TOPIC_RULES: { topic: BlogTopic; pattern: RegExp }[] = [
  { topic: 'storage', pattern: /speicher|batterie/ },
  { topic: 'heatPumps', pattern: /waermepumpe|heizung/ },
  { topic: 'charging', pattern: /ladestation|wallbox|v2h|laden/ },
  { topic: 'repowering', pattern: /repowering/ },
  { topic: 'service', pattern: /wartung|hagel|versicherung|brandschutz/ },
  { topic: 'subsidies', pattern: /foerder|einmalverguetung|solaroffensive/ },
  {
    topic: 'cost',
    pattern:
      /solaranlage-kosten|preise-pro|offerte|lohnt-sich-photovoltaik|steuer-abziehen|amortis|mieten-oder-kaufen|hauswert|werkvertrag|rote-flaggen/,
  },
  { topic: 'communities', pattern: /(^|-)(leg|zev)-|mehrfamilienhaus/ },
  {
    topic: 'tariffs',
    pattern:
      /verguetung|tarif|marktpreis|einspeise|stromrechnung|rueckliefer|flexibilitaet|stromabkommen/,
  },
  { topic: 'obligations', pattern: /solarpflicht/ },
]

export const TOPIC_PATHS = {
  storage: '/energy-storage',
  heatPumps: '/heat-pumps',
  charging: '/charging-stations',
  subsidies: '/foerderung',
  cost: '/cost',
  service: '/service',
  repowering: '/repowering',
} as const satisfies Record<PageTopic, string>

export function isPageTopic(topic: BlogTopic | null): topic is PageTopic {
  return topic !== null && topic in TOPIC_PATHS
}

export function blogTopic(slug: string): BlogTopic | null {
  return TOPIC_RULES.find(rule => rule.pattern.test(slug))?.topic ?? null
}

const STOPWORDS = new Set([
  'schweiz',
  'schweizer',
  'solar',
  'solaranlage',
  'solaranlagen',
  'photovoltaik',
  'anlage',
  'ihre',
  'ihrem',
  'ihren',
  'wirklich',
  'welche',
  'erste',
  'neue',
  'warum',
  'lohnt',
  'bringt',
])

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }

function postTokens(post: Pick<AdminBlogPost, 'slug' | 'translations'>) {
  const title =
    post.translations.find(t => t.language === 'de')?.title ||
    post.translations[0]?.title ||
    ''
  const titleWords = title
    .toLowerCase()
    .replace(/[äöüß]/g, char => UMLAUTS[char])
    .split(/[^a-z0-9]+/)
    .filter(word => word.length > 4)
  const slugWords = post.slug.split('-').filter(word => word.length > 2)
  return new Set(
    [...slugWords, ...titleWords].filter(
      word => !/^\d+$/.test(word) && !STOPWORDS.has(word)
    )
  )
}

export function relatedPosts(
  current: Pick<AdminBlogPost, 'slug' | 'translations'>,
  posts: AdminBlogPost[],
  limit = 3
): AdminBlogPost[] {
  const topic = blogTopic(current.slug)
  const tokens = postTokens(current)

  return posts
    .filter(post => post.slug !== current.slug)
    .map(post => {
      let score = topic && blogTopic(post.slug) === topic ? 3 : 0
      for (const token of postTokens(post)) {
        if (tokens.has(token)) score += 1
      }
      return {
        post,
        score,
        time: post.publishedAt ? Date.parse(post.publishedAt) : 0,
      }
    })
    .sort((a, b) => b.score - a.score || b.time - a.time)
    .slice(0, limit)
    .map(entry => entry.post)
}
