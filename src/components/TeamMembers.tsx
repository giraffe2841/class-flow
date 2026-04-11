"use client";

import { useState } from "react";

const team = [
  {
    name: "김민준",
    role: "기능 개발",
    tag: "Feature",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    accent: "bg-blue-500",
    description: "핵심 기능 설계 및 구현을 담당합니다. API 연동, 비즈니스 로직, 컴포넌트 개발을 주도합니다.",
    icon: "⚙️",
  },
  {
    name: "이서연",
    role: "보안",
    tag: "Security",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    accent: "bg-red-500",
    description: "인증·인가, 취약점 분석, 보안 정책 수립을 담당합니다. 안전한 서비스 운영을 책임집니다.",
    icon: "🔒",
  },
  {
    name: "박지호",
    role: "스타일",
    tag: "Style",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    accent: "bg-purple-500",
    description: "UI/UX 디자인 시스템 구축과 Tailwind 스타일링을 담당합니다. 일관된 사용자 경험을 만듭니다.",
    icon: "🎨",
  },
  {
    name: "최하은",
    role: "기획",
    tag: "Planning",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    accent: "bg-green-500",
    description: "요구사항 정의, 로드맵 수립, 스프린트 관리를 담당합니다. 팀의 방향과 우선순위를 조율합니다.",
    icon: "📋",
  },
];

export default function TeamMembers() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="w-full max-w-3xl px-4 py-12">
      <h2 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        팀 구성
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {team.map((member, index) => (
          <div
            key={member.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={`h-1 w-full ${member.accent}`} />
            <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{member.icon}</span>
                <div>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {member.name}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${member.color}`}
                  >
                    {member.tag}
                  </span>
                </div>
              </div>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                  hoveredIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {member.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
