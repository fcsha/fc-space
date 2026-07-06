export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-Hans', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function dateLabel(updatedDate?: Date): string {
  return updatedDate ? '更新于' : '发布于'
}

export function dateTitle(pubDate: Date, updatedDate?: Date): string {
  return updatedDate
    ? `发布于 ${formatDate(pubDate)}，更新于 ${formatDate(updatedDate)}`
    : `发布于 ${formatDate(pubDate)}`
}
