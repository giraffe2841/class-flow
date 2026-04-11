export const PLAN_PRICE = {
  pro: 3900,
  premium: 7900,
}

export const PADDLE_PRICE_ID = {
  pro: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO!,
  premium: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM!,
}

// 월별 AI 토큰 한도 (Anthropic 토큰 기준)
export const AI_TOKEN_LIMITS = {
  free: 10_000,      // 월 1만 토큰 (기본)
  pro: 50_000,       // 월 5만 토큰 (일반사용자의 5배)
  premium: 100_000,  // 월 10만 토큰 (일반사용자의 10배)
} as const

export const PLAN_LIMITS = {
  free: {
    classes: 10,
    subjects: 1,
    aiReplan: 0,
    materials: 3,
    examRange: false,
    report: false,
    alert: false,
    aiChat: true,
    aiTokens: AI_TOKEN_LIMITS.free,
  },
  pro: {
    classes: 5,
    subjects: 3,
    aiReplan: 20,
    materials: 50,
    examRange: true,
    report: true,
    alert: true,
    aiChat: true,
    aiTokens: AI_TOKEN_LIMITS.pro,
  },
  premium: {
    classes: Infinity,
    subjects: Infinity,
    aiReplan: Infinity,
    materials: Infinity,
    examRange: true,
    report: true,
    alert: true,
    aiChat: true,
    aiTokens: AI_TOKEN_LIMITS.premium,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
