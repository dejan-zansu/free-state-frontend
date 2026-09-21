// Posts that were superseded by a newer, better researched post on the same
// question. The old URL redirects permanently (next.config.ts imports this
// map), links inside other posts go straight to the new post, and the old one
// stays out of the sitemap. Archive the old post in /admin/blog as well, this
// map only covers the time until that happens and any link from outside.
export const REPLACED_POSTS: Record<string, string> = {
  'batteriespeicher-2026-lohnt-sich-rechnung':
    'stromspeicher-kosten-schweiz-2026-lohnt-sich',
}
