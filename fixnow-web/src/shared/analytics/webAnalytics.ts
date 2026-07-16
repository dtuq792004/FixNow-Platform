import { API_BASE_URL } from '../constants/api'

/**
 * Tracker web analytics first-party (thay Vercel Analytics). Cookieless:
 * - Gửi beacon pageview khi tải trang + mỗi lần đổi route (SPA).
 * - sessionId lưu ở sessionStorage (30 phút) để backend tính bounce rate.
 * - Chỉ gửi utm_source/medium/campaign (không gửi toàn bộ query string).
 * - hostname/IP do server tự suy ra (không gửi từ client).
 */

const COLLECT_URL = `${API_BASE_URL}/analytics/collect`
const SESSION_KEY = 'fx_sid'
const SESSION_TTL = 30 * 60 * 1000 // 30 phút

// Không track khu vực đăng nhập (không phải "khách").
const EXCLUDED_PREFIXES = ['/admin', '/customer', '/provider', '/auth']

const shouldTrack = (path: string) => !EXCLUDED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))

let memorySid = '' // fallback khi sessionStorage bị chặn

const randomId = () => {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

const getSessionId = (): string => {
  const now = Date.now()
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const parsed = raw ? (JSON.parse(raw) as { id: string; ts: number }) : null
    const id = parsed && now - parsed.ts < SESSION_TTL ? parsed.id : randomId()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: now }))
    return id
  } catch {
    if (!memorySid) memorySid = randomId()
    return memorySid
  }
}

const parseUtm = () => {
  try {
    const q = new URLSearchParams(window.location.search)
    return {
      utmSource: q.get('utm_source') || undefined,
      utmMedium: q.get('utm_medium') || undefined,
      utmCampaign: q.get('utm_campaign') || undefined,
    }
  } catch {
    return {}
  }
}

const send = (body: Record<string, unknown>) => {
  try {
    fetch(COLLECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {})
  } catch {
    /* nuốt lỗi — tracker không được làm hỏng UX */
  }
}

let lastPath = ''

export const trackPageview = (path: string) => {
  if (!path || path === lastPath || !shouldTrack(path)) return
  lastPath = path
  send({
    type: 'pageview',
    path,
    referrer: document.referrer || '',
    sessionId: getSessionId(),
    ...parseUtm(),
  })
}

export const trackEvent = (name: string) => {
  if (!shouldTrack(window.location.pathname)) return
  send({ type: name, path: window.location.pathname, sessionId: getSessionId() })
}
