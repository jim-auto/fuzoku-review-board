export type OpenStatusKind = 'open' | 'before_open' | 'closed' | 'unknown'

export interface OpenStatus {
  kind: OpenStatusKind
  label: string
  detail: string
}

const TIME_PATTERN = /(\d{1,2})(?::(\d{2}))?\s*[〜～-]\s*(翌)?\s*(\d{1,2}|LAST)(?::(\d{2}))?/i

const normalizeMinutes = (hour: number, minute: number) => {
  if (hour === 24) return 24 * 60 + minute
  return hour * 60 + minute
}

const formatMinutes = (minutes: number) => {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hour = Math.floor(normalized / 60)
  const minute = normalized % 60
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function getOpenStatus(hours: string, now = new Date()): OpenStatus {
  if (!hours || hours.includes('掲載元') || hours.includes('確認')) {
    return { kind: 'unknown', label: '時間要確認', detail: hours || '営業時間未掲載' }
  }

  const match = hours.match(TIME_PATTERN)
  if (!match) {
    if (/24時間|24h/i.test(hours)) {
      return { kind: 'open', label: '営業中', detail: '24時間営業' }
    }
    return { kind: 'unknown', label: '時間要確認', detail: hours }
  }

  const startHour = Number(match[1])
  const startMinute = Number(match[2] ?? 0)
  const endRaw = match[4]
  const endHour = endRaw.toUpperCase() === 'LAST' ? 29 : Number(endRaw)
  const endMinute = Number(match[5] ?? 0)
  const start = normalizeMinutes(startHour, startMinute)
  let end = normalizeMinutes(endHour, endMinute)

  if (match[3] || end <= start || endHour >= 24) {
    end += 24 * 60
  }

  const current = now.getHours() * 60 + now.getMinutes()
  const currentForOvernight = current < start && end > 24 * 60 ? current + 24 * 60 : current

  if (currentForOvernight >= start && currentForOvernight < end) {
    return { kind: 'open', label: '営業中', detail: `${formatMinutes(end)}まで` }
  }

  if (current < start) {
    return { kind: 'before_open', label: '開始前', detail: `${formatMinutes(start)}から` }
  }

  return { kind: 'closed', label: '本日終了', detail: `次回 ${formatMinutes(start)}から` }
}

export function getOpenStatusStyle(kind: OpenStatusKind) {
  switch (kind) {
    case 'open':
      return { color: '#00ff9f', background: 'rgba(0,255,159,0.1)', borderColor: 'rgba(0,255,159,0.32)' }
    case 'before_open':
      return { color: '#ffaa00', background: 'rgba(255,170,0,0.1)', borderColor: 'rgba(255,170,0,0.32)' }
    case 'closed':
      return { color: '#ff5a78', background: 'rgba(255,90,120,0.1)', borderColor: 'rgba(255,90,120,0.32)' }
    default:
      return { color: '#9aa4b2', background: 'rgba(154,164,178,0.08)', borderColor: 'rgba(154,164,178,0.24)' }
  }
}
