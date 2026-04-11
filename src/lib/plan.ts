import { PLAN_LIMITS, AI_TOKEN_LIMITS, type Plan } from './constants'

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

export function canCreateClass(plan: Plan, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentCount < limits.classes
}

export function canCreateSubject(plan: Plan, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentCount < limits.subjects
}

export function canUseAiReplan(plan: Plan, usageCount: number): boolean {
  const limits = getPlanLimits(plan)
  if (limits.aiReplan === 0) return false
  if (limits.aiReplan === Infinity) return true
  return usageCount < limits.aiReplan
}

export function canUseExamRange(plan: Plan): boolean {
  return getPlanLimits(plan).examRange
}

export function canUploadMaterial(plan: Plan, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentCount < limits.materials
}

export function canUseAiChat(plan: Plan): boolean {
  return getPlanLimits(plan).aiChat
}

export function canUseAlert(plan: Plan): boolean {
  return getPlanLimits(plan).alert
}

/** 토큰 한도 내에서 AI를 사용할 수 있는지 확인 */
export function canUseAiTokens(plan: Plan, usedTokens: number): boolean {
  if (!canUseAiChat(plan)) return false
  const limit = AI_TOKEN_LIMITS[plan]
  if (limit === Infinity) return true
  return usedTokens < limit
}

/** 남은 토큰 수 (Infinity면 무제한) */
export function getRemainingTokens(plan: Plan, usedTokens: number): number {
  const limit = AI_TOKEN_LIMITS[plan]
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - usedTokens)
}

/** 토큰 사용률 (0~100, 무제한이면 0) */
export function getTokenUsagePercent(plan: Plan, usedTokens: number): number {
  const limit = AI_TOKEN_LIMITS[plan]
  if (limit === Infinity) return 0
  return Math.min(100, Math.round((usedTokens / limit) * 100))
}
