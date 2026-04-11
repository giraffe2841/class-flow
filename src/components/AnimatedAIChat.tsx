"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileUp,
  MonitorIcon,
  SendIcon,
  Paperclip,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
  BookOpen,
  CalendarDays,
  Zap,
  CheckCircle,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { getRemainingTokens, getTokenUsagePercent } from "@/lib/plan";
import type { Plan } from "@/lib/constants";
import { AI_TOKEN_LIMITS } from "@/lib/constants";
import PlanCommandSelector, { type PlanSelection } from "@/components/PlanCommandSelector";

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant" | "selector";
  content: string;
  isLessonPlan?: boolean;
  lessonPlan?: LessonPlan;
}

interface LessonPlan {
  title: string;
  subject: string;
  grade: string;
  totalSessions: number;
  objectives: string[];
  overview: string;
  sessions: {
    session: number;
    title: string;
    duration: string;
    activities: string[];
    materials: string[];
    assessment: string;
  }[];
  notes: string;
  tokensUsed?: number;
}

interface UploadedFile {
  name: string;
  text: string;
  size: number;
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

// ─── useAutoResizeTextarea ────────────────────────────────────────────────────

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) { textarea.style.height = `${minHeight}px`; return; }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Infinity));
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handle = () => adjustHeight();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

// ─── 파일 텍스트 추출 ──────────────────────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "text/plain") {
    return await file.text();
  }
  return `[파일: ${file.name}, 크기: ${(file.size / 1024).toFixed(1)}KB]`;
}

// ─── TypingDots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-[#005394] rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── 수업계획 카드 ────────────────────────────────────────────────────────────

function LessonPlanCard({ plan }: { plan: LessonPlan }) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const supabase = createClient();

  async function handleAddToDashboard() {
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      const year = new Date().getFullYear();
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .insert({ user_id: user.id, name: plan.subject || plan.title, year })
        .select("id")
        .single();
      if (subjectError) throw subjectError;

      const { data: unitData, error: unitError } = await supabase
        .from("units")
        .insert({ subject_id: subjectData.id, order: 1, title: plan.title })
        .select("id")
        .single();
      if (unitError) throw unitError;

      if (plan.sessions.length > 0) {
        const { error: lessonsError } = await supabase.from("lessons").insert(
          plan.sessions.map((s) => ({
            unit_id: unitData.id,
            order: s.session,
            title: `${s.session}차시: ${s.title}`,
          }))
        );
        if (lessonsError) throw lessonsError;
      }

      setAdded(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "수업계획 추가 중 오류가 발생했습니다");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mt-2 bg-white rounded-xl border border-[#e1e2e8] overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-[#d3e4ff] border-b border-[#a2c9ff] flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#004881]" />
        <span className="text-sm font-semibold text-[#001c38]">{plan.title}</span>
        <span className="ml-auto text-xs text-[#414750]">{plan.subject} · {plan.grade} · {plan.totalSessions}차시</span>
      </div>

      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-[#414750] leading-relaxed">{plan.overview}</p>

        <div>
          <p className="text-xs font-semibold text-[#727782] mb-1.5">학습 목표</p>
          <ul className="space-y-1">
            {plan.objectives.map((obj, i) => (
              <li key={i} className="text-xs text-[#191c20] flex items-start gap-1.5">
                <span className="text-[#005394] mt-0.5">•</span>{obj}
              </li>
            ))}
          </ul>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {plan.sessions.map((s) => (
                <div key={s.session} className="bg-[#f2f3fa] rounded-lg p-3 border border-[#e1e2e8]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#005394]">{s.session}차시</span>
                    <span className="text-xs font-semibold text-[#191c20]">{s.title}</span>
                    <span className="ml-auto text-xs text-[#727782]">{s.duration}</span>
                  </div>
                  <ul className="space-y-0.5 mb-2">
                    {s.activities.map((a, i) => (
                      <li key={i} className="text-xs text-[#414750] flex gap-1.5">
                        <span className="text-[#c1c7d2]">-</span>{a}
                      </li>
                    ))}
                  </ul>
                  {s.materials.length > 0 && (
                    <p className="text-xs text-[#727782]">준비물: {s.materials.join(", ")}</p>
                  )}
                </div>
              ))}

              {plan.notes && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-700">{plan.notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[#005394] hover:text-[#004881] transition-colors font-medium"
        >
          {expanded ? "접기 ▲" : `${plan.sessions.length}개 차시 펼치기 ▼`}
        </button>

        {/* 수업계획 추가 버튼 */}
        <div className="mt-3 pt-3 border-t border-[#e1e2e8]">
          {added ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <CheckCircle className="w-4 h-4" />
                대시보드에 추가됐습니다!
              </span>
              <a
                href="/dashboard"
                className="text-xs text-[#005394] font-semibold hover:underline"
              >
                대시보드 바로가기 →
              </a>
            </div>
          ) : (
            <button
              onClick={handleAddToDashboard}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#005394] hover:bg-[#004881] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {adding ? (
                <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              {adding ? "추가 중..." : "수업계획 추가 → 대시보드에 표시"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 토큰 현황 바 ─────────────────────────────────────────────────────────────

function TokenBar({ plan, tokensUsed }: { plan: Plan; tokensUsed: number }) {
  const remaining = getRemainingTokens(plan, tokensUsed);
  const percent = getTokenUsagePercent(plan, tokensUsed);
  const limit = AI_TOKEN_LIMITS[plan];

  if (plan === "free") return null;
  if (limit === Infinity) return (
    <div className="flex items-center gap-1.5 text-xs text-[#727782]">
      <Zap className="w-3 h-3" />
      <span>무제한</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Zap className="w-3 h-3 text-[#727782] flex-shrink-0" />
      <div className="flex-1 h-1 bg-[#e1e2e8] rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-[#005394]"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-xs text-[#727782] tabular-nums flex-shrink-0">
        {remaining.toLocaleString()} 남음
      </span>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export function AnimatedAIChat() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [plan, setPlan] = useState<Plan>("free");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [, startTransition] = useTransition();

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 구독 정보 로드
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan, ai_tokens_used")
        .eq("user_id", user.id)
        .single();
      if (sub) {
        setPlan(sub.plan as Plan);
        setTokensUsed(sub.ai_tokens_used ?? 0);
      }
    }
    load();
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 커맨드 팔레트 외부 클릭 닫기
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = document.querySelector("[data-command-button]");
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(target) && !btn?.contains(target)) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const commandSuggestions: CommandSuggestion[] = [
    { icon: <BookOpen className="w-4 h-4" />, label: "수업계획 생성", description: "파일로 수업계획 자동 생성", prefix: "/plan" },
    { icon: <CalendarDays className="w-4 h-4" />, label: "진도 조언", description: "밀린 진도 따라잡기 전략", prefix: "/progress" },
    { icon: <MonitorIcon className="w-4 h-4" />, label: "수업 전략", description: "단원별 수업 전략 제안", prefix: "/strategy" },
    { icon: <Sparkles className="w-4 h-4" />, label: "시험범위 조정", description: "시험 범위 역산 계획", prefix: "/exam" },
  ];

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const idx = commandSuggestions.findIndex((c) => c.prefix.startsWith(value));
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  function selectCommand(index: number) {
    const cmd = commandSuggestions[index];
    setShowCommandPalette(false);
    if (cmd.prefix === "/plan") {
      setValue("");
      setShowPlanSelector(true);
    } else {
      setValue(cmd.prefix + " ");
      textareaRef.current?.focus();
    }
  }

  async function handlePlanSelectorComplete(selection: PlanSelection) {
    setShowPlanSelector(false);
    const schoolLabel = selection.schoolType === "middle" ? "중학교" : "고등학교";
    const userContent = `${schoolLabel} ${selection.grade}학년 ${selection.subject} 수업계획을 생성해주세요`;
    const userMsg: Message = { role: "user", content: userContent };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selection.subject,
          grade: `${schoolLabel} ${selection.grade}학년`,
          schoolType: selection.schoolType,
          totalSessions: 4,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: err.error ?? "오류가 발생했습니다" }]);
        return;
      }

      const lessonPlan = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `**${lessonPlan.title}** 수업계획을 생성했습니다.`,
        isLessonPlan: true,
        lessonPlan,
      }]);

      if (lessonPlan.tokensUsed) {
        setTokensUsed((prev) => prev + (lessonPlan.tokensUsed ?? 0));
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "수업계획 생성 중 오류가 발생했습니다" }]);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── 파일 업로드 처리 ───────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const text = await extractTextFromFile(file);
      setUploadedFiles((prev) => [...prev, { name: file.name, text, size: file.size }]);
    }
    e.target.value = "";
  }

  // ─── AI 채팅 전송 ──────────────────────────────────────────────────────────

  async function handleSend() {
    const trimmed = value.trim();
    if (!trimmed && uploadedFiles.length === 0) return;
    if (isLoading) return;

    if (trimmed.startsWith("/plan") && uploadedFiles.length > 0) {
      await handleGenerateLessonPlan();
      return;
    }

    let userContent = trimmed;
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map(f => `[첨부: ${f.name}]\n${f.text}`).join("\n\n");
      userContent = `${trimmed}\n\n${fileInfo}`;
    }

    const userMsg: Message = { role: "user", content: trimmed || `파일 첨부: ${uploadedFiles.map(f => f.name).join(", ")}` };
    setMessages((prev) => [...prev, userMsg]);
    setValue("");
    setUploadedFiles([]);
    adjustHeight(true);
    setIsLoading(true);

    const apiMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userContent },
    ];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: err.error ?? "오류가 발생했습니다" }]);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(chunk);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      }

      startTransition(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("ai_tokens_used")
          .eq("user_id", user.id)
          .single();
        if (sub) setTokensUsed(sub.ai_tokens_used ?? 0);
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "네트워크 오류가 발생했습니다" }]);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── 수업계획 생성 ─────────────────────────────────────────────────────────

  async function handleGenerateLessonPlan() {
    if (uploadedFiles.length === 0) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "수업계획을 생성하려면 학습 자료 파일을 먼저 첨부해주세요.",
      }]);
      return;
    }

    const file = uploadedFiles[0];
    const userMsg: Message = {
      role: "user",
      content: `📄 ${file.name} 파일로 수업계획을 생성해주세요`,
    };
    setMessages((prev) => [...prev, userMsg]);
    setValue("");
    setUploadedFiles([]);
    adjustHeight(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileText: file.text,
          fileName: file.name,
          totalSessions: 4,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: err.error ?? "오류가 발생했습니다" }]);
        return;
      }

      const lessonPlan: LessonPlan = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `**${lessonPlan.title}** 수업계획을 생성했습니다.`,
        isLessonPlan: true,
        lessonPlan,
      }]);

      if (lessonPlan.tokensUsed) {
        setTokensUsed((prev) => prev + (lessonPlan.tokensUsed ?? 0));
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "수업계획 생성 중 오류가 발생했습니다" }]);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── 키보드 핸들러 ─────────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestion((p) => (p < commandSuggestions.length - 1 ? p + 1 : 0)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestion((p) => (p > 0 ? p - 1 : commandSuggestions.length - 1)); }
      else if ((e.key === "Tab" || e.key === "Enter") && activeSuggestion >= 0) { e.preventDefault(); selectCommand(activeSuggestion); }
      else if (e.key === "Escape") { e.preventDefault(); setShowCommandPalette(false); }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = (value.trim().length > 0 || uploadedFiles.length > 0) && !isLoading;

  // ─── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff] text-[#191c20] relative overflow-hidden">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative z-10">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 로고 아이콘 */}
            <div className="w-14 h-14 rounded-2xl bg-[#005394] flex items-center justify-center shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#191c20]">ClassFlow AI</h2>
              <p className="text-sm text-[#727782] mt-1">수업 계획, 진도 관리, 학습자료 분석</p>
            </div>

            {/* 퀵 액션 버튼 */}
            <div className="flex flex-wrap justify-center gap-2">
              {commandSuggestions.map((cmd, i) => (
                <motion.button
                  key={cmd.prefix}
                  onClick={() => {
                    if (cmd.prefix === "/plan") {
                      setShowPlanSelector(true);
                    } else {
                      setValue(cmd.prefix + " ");
                      textareaRef.current?.focus();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#d3e4ff] rounded-xl text-sm text-[#414750] hover:text-[#004881] transition-all border border-[#e1e2e8] hover:border-[#a2c9ff] shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {cmd.icon}
                  <span>{cmd.label}</span>
                </motion.button>
              ))}
            </div>

            {plan === "free" && (
              <motion.div
                className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                AI 기능은 프로 플랜 이상에서 사용 가능합니다.{" "}
                <a href="/subscription" className="underline font-semibold hover:text-amber-800">업그레이드 →</a>
              </motion.div>
            )}
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-[#005394] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={cn(
              "max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap",
              msg.role === "user"
                ? "bg-[#005394] text-white rounded-br-sm shadow-sm"
                : "bg-white text-[#191c20] rounded-bl-sm border border-[#e1e2e8] shadow-sm"
            )}>
              {msg.content}
              {msg.isLessonPlan && msg.lessonPlan && <LessonPlanCard plan={msg.lessonPlan} />}
            </div>
          </motion.div>
        ))}

        {/* 수업계획 셀렉터 (인라인) */}
        <AnimatePresence>
          {showPlanSelector && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-7 h-7 rounded-lg bg-[#005394] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <PlanCommandSelector
                onComplete={handlePlanSelectorComplete}
                onCancel={() => setShowPlanSelector(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-7 h-7 rounded-lg bg-[#005394] flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-[#e1e2e8] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
              <span className="text-xs text-[#727782]">생성 중</span>
              <TypingDots />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="relative z-10 px-4 pb-4">
        <motion.div
          className="relative bg-white rounded-2xl border border-[#c1c7d2] shadow-sm focus-within:border-[#005394] focus-within:shadow-md transition-all"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* 커맨드 팔레트 */}
          <AnimatePresence>
            {showCommandPalette && (
              <motion.div
                ref={commandPaletteRef}
                className="absolute left-4 right-4 bottom-full mb-2 bg-white rounded-xl z-50 border border-[#e1e2e8] overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                {commandSuggestions.map((cmd, index) => (
                  <motion.div
                    key={cmd.prefix}
                    onClick={() => selectCommand(index)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-xs cursor-pointer transition-colors",
                      activeSuggestion === index
                        ? "bg-[#d3e4ff] text-[#004881]"
                        : "text-[#414750] hover:bg-[#f2f3fa]"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <span className="text-[#005394]">{cmd.icon}</span>
                    <span className="font-medium">{cmd.label}</span>
                    <span className="text-[#727782]">{cmd.description}</span>
                    <span className="ml-auto text-[#005394] font-mono">{cmd.prefix}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 첨부 파일 목록 */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                className="px-4 pt-3 flex gap-2 flex-wrap"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {uploadedFiles.map((file, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2 text-xs bg-[#d3e4ff] border border-[#a2c9ff] py-1.5 px-3 rounded-lg text-[#004881]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <FileUp className="w-3 h-3 text-[#005394]" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => setUploadedFiles((p) => p.filter((_, i) => i !== idx))} className="text-[#727782] hover:text-[#191c20] transition-colors">
                      <XIcon className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 텍스트 입력 */}
          <div className="px-4 pt-3">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder={plan === "free" ? "프로 플랜에서 AI를 사용할 수 있습니다..." : "수업 계획이나 진도에 대해 물어보세요... (/ 로 커맨드)"}
              disabled={plan === "free"}
              className={cn(
                "w-full resize-none bg-transparent border-none text-[#191c20] text-sm",
                "focus:outline-none placeholder:text-[#c1c7d2] min-h-[60px]",
                plan === "free" && "opacity-50 cursor-not-allowed"
              )}
              style={{ overflow: "hidden" }}
            />
          </div>

          {/* 하단 툴바 */}
          <div className="px-4 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* 파일 첨부 */}
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileTap={{ scale: 0.94 }}
                disabled={plan === "free"}
                className="p-2 text-[#727782] hover:text-[#005394] hover:bg-[#f2f3fa] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="파일 첨부 (PDF, Word, 텍스트)"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.hwp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* 커맨드 팔레트 토글 */}
              <motion.button
                type="button"
                data-command-button
                onClick={(e) => { e.stopPropagation(); setShowCommandPalette((p) => !p); }}
                whileTap={{ scale: 0.94 }}
                disabled={plan === "free"}
                className={cn(
                  "p-2 text-[#727782] hover:text-[#005394] hover:bg-[#f2f3fa] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                  showCommandPalette && "bg-[#d3e4ff] text-[#005394]"
                )}
              >
                <Command className="w-4 h-4" />
              </motion.button>

              {/* 토큰 바 */}
              <div className="hidden sm:flex items-center w-36">
                <TokenBar plan={plan} tokensUsed={tokensUsed} />
              </div>
            </div>

            {/* 전송 버튼 */}
            <motion.button
              type="button"
              onClick={handleSend}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={!canSend || plan === "free"}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                canSend && plan !== "free"
                  ? "bg-[#005394] hover:bg-[#004881] text-white shadow-sm"
                  : "bg-[#e1e2e8] text-[#c1c7d2] cursor-not-allowed"
              )}
            >
              {isLoading
                ? <LoaderIcon className="w-4 h-4 animate-spin" />
                : uploadedFiles.length > 0 && value.startsWith("/plan")
                  ? <><BookOpen className="w-4 h-4" /><span>수업계획 생성</span></>
                  : <><SendIcon className="w-4 h-4" /><span>전송</span></>
              }
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
