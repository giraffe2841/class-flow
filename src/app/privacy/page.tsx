export const metadata = {
  title: '개인정보처리방침 | ClassFlow',
  description: 'ClassFlow 개인정보처리방침',
}

const sections = [
  {
    title: '제1조 (개인정보의 처리 목적)',
    content: `ClassFlow(이하 "서비스")는 다음 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음 목적 이외의 용도로는 사용되지 않으며, 목적이 변경될 경우 사전에 동의를 받겠습니다.

① 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 부정 이용 방지
② 서비스 제공: AI 진도 관리, 수업 계획 생성, 학습지 관리 등 핵심 서비스 제공
③ 결제 및 구독 관리: 유료 서비스 결제 처리 및 구독 이력 관리
④ 고충 처리: 민원인의 신원 확인, 민원사항 확인, 처리 결과 통보`,
  },
  {
    title: '제2조 (처리하는 개인정보 항목)',
    content: `서비스는 다음 개인정보를 수집·처리합니다.

① 필수 수집 항목
   - 이메일 주소 (로그인 및 계정 관리)
   - 서비스 이용 기록, 접속 로그, 접속 IP 정보

② 서비스 이용 중 생성되는 정보
   - 수업 계획, 학급 정보, 진도 데이터, 학습지 등 이용자가 직접 입력한 교육 콘텐츠
   - AI 채팅 내역 및 AI 기능 사용 이력

③ 유료 결제 시 추가 수집 항목
   - 결제 정보 (Paddle을 통해 처리되며, 카드 정보는 서비스가 직접 보유하지 않음)`,
  },
  {
    title: '제3조 (개인정보의 처리 및 보유 기간)',
    content: `① 서비스는 법령에 따른 개인정보 보유·이용 기간 또는 이용자가 동의한 기간 내에서 개인정보를 처리·보유합니다.

② 각 개인정보 처리 및 보유 기간은 다음과 같습니다.
   - 회원 정보: 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)
   - 결제 및 거래 기록: 전자상거래법에 따라 5년
   - 접속 로그: 통신비밀보호법에 따라 3개월
   - AI 이용 기록: 서비스 탈퇴 후 30일 이내 파기`,
  },
  {
    title: '제4조 (개인정보의 제3자 제공)',
    content: `① 서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.

② 다음의 경우에는 예외로 합니다.
   - 이용자가 사전에 동의한 경우
   - 법령의 규정에 따르거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우

③ 결제 처리를 위해 Paddle Inc.에 최소한의 정보(이메일, 구독 정보)가 전달됩니다.`,
  },
  {
    title: '제5조 (개인정보 처리 위탁)',
    content: `서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보를 위탁하고 있습니다.

| 수탁업체 | 위탁 업무 | 보유 기간 |
|---|---|---|
| Supabase Inc. | 데이터베이스 호스팅 및 인증 | 회원 탈퇴 시까지 |
| Paddle Inc. | 결제 처리 및 구독 관리 | 거래 종료 후 5년 |
| Groq Inc. | AI 기능 처리 (채팅, 재계획 등) | 처리 즉시 파기 |
| Vercel Inc. | 서비스 호스팅 | 서비스 이용 기간 |`,
  },
  {
    title: '제6조 (이용자의 권리·의무 및 행사 방법)',
    content: `① 이용자는 서비스에 대해 언제든지 다음 권리를 행사할 수 있습니다.
   - 개인정보 열람 요청
   - 오류 정정 요청
   - 삭제 요청
   - 처리 정지 요청

② 권리 행사는 서비스 내 설정 페이지 또는 문의하기를 통해 할 수 있습니다.

③ 이용자는 개인정보의 정확성·최신성 유지를 위해 변경 사항을 즉시 업데이트할 의무가 있습니다.`,
  },
  {
    title: '제7조 (개인정보의 파기)',
    content: `① 서비스는 개인정보 보유 기간이 경과하거나 처리 목적이 달성되면 지체 없이 해당 개인정보를 파기합니다.

② 파기 절차 및 방법
   - 전자 파일: 복구 불가능한 방법으로 영구 삭제
   - 종이 문서: 분쇄 또는 소각

③ 회원 탈퇴 시 즉시 처리되며, 법령에 따라 보존이 필요한 정보는 해당 기간 경과 후 파기합니다.`,
  },
  {
    title: '제8조 (개인정보 보호를 위한 안전성 확보 조치)',
    content: `서비스는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.

① 기술적 조치
   - 개인정보 암호화 (전송 구간 SSL/TLS 적용)
   - 접근 권한 관리 및 인증 시스템 운영
   - 보안 취약점 정기 점검

② 관리적 조치
   - 개인정보 취급 직원 최소화
   - 내부 관리 계획 수립 및 시행`,
  },
  {
    title: '제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)',
    content: `① 서비스는 이용자에게 편의를 제공하기 위해 쿠키(cookie)를 사용합니다.

② 쿠키는 웹사이트 운영에 사용되는 소규모 텍스트 파일로, 브라우저를 통해 이용자의 컴퓨터에 저장됩니다.

③ 이용자는 쿠키 설치에 대한 선택권을 가지며, 브라우저 설정을 통해 쿠키를 허용하거나 거부할 수 있습니다. 단, 쿠키 설치를 거부할 경우 서비스 이용에 불편이 생길 수 있습니다.`,
  },
  {
    title: '제10조 (개인정보 보호책임자)',
    content: `서비스는 개인정보 처리에 관한 업무를 총괄하고 이용자의 불만 처리 및 피해 구제를 위해 개인정보 보호책임자를 지정하고 있습니다.

- 책임자: ClassFlow 운영팀
- 문의: 서비스 내 문의하기 이용

이용자는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만, 피해 구제 등에 관한 사항을 문의하실 수 있습니다.`,
  },
  {
    title: '제11조 (개인정보처리방침의 변경)',
    content: `① 본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 변경될 수 있습니다.

② 내용 변경 시 시행일 최소 7일 전부터 서비스 공지사항을 통해 고지합니다.

③ 이용자의 권리에 중요한 변경이 있을 경우 30일 전에 고지합니다.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tighter">ClassFlow</a>
          <a href="/login" className="text-[13px] font-medium text-[#6B7280] hover:text-[#0A0A0B] transition-colors">로그인</a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-[12px] font-bold text-[#0052FF] uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">개인정보처리방침</h1>
          <p className="text-[#6B7280] text-sm">시행일: 2026년 1월 1일 · 최종 수정일: 2026년 4월 12일</p>
        </div>

        <div className="space-y-10">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-lg font-bold mb-3">{title}</h2>
              <p className="text-[14px] text-[#6B7280] leading-relaxed whitespace-pre-line">{content}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-[#E5E7EB] text-center">
          <p className="text-sm text-[#6B7280]">개인정보 관련 문의는 서비스 내 문의하기를 이용해 주세요.</p>
          <a href="/" className="inline-block mt-6 text-[13px] font-semibold text-[#0052FF] hover:underline">← 홈으로 돌아가기</a>
        </div>
      </main>

      <footer className="border-t border-[#E5E7EB] py-8 text-center text-[11px] text-[#6B7280]">
        © 2026 ClassFlow. All rights reserved.
      </footer>
    </div>
  )
}
