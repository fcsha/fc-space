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
