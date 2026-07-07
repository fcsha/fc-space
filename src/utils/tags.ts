export function tagToSlug(tag: string): string {
  return tag.replace(/\//g, '-')
}

export function collectTags(
  posts: { data: { tags: string[] } }[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of posts) {
    for (const t of p.data.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => {
    const diff = b.count - a.count
    if (diff !== 0) return diff
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  })
}

export const filterButtonClass = {
  base: 'border px-3 py-1 text-sm transition-colors',
  active:
    'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300',
  inactive:
    'border-zinc-200 text-zinc-600 hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400',
}
