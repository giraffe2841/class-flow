export const metadata = {
  title: '이용약관 | ClassFlow',
  description: 'ClassFlow 서비스 이용약관',
}

const sections = [
  {
    title: '제1조 (목적)',
    content: `본 약관은 ClassFlow(이하 "서비스")가 제공하는 AI 수업 진도 관리 플랫폼의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: '제2조 (정의)',
    content: `① "서비스"란 ClassFlow가 제공하는 AI 기반 수업 진도 관리, 일정 재계획, 학습지 관리 등 일체의 기능을 의미합니다.
② "이용자"란 본 약관에 동의하고 서비스를 이용하는 교사 및 교육 종사자를 의미합니다.
③ "콘텐츠"란 이용자가 서비스 내에 등록한 수업 계획, 학습지, 진도 데이터 등 일체의 자료를 의미합니다.`,
  },
  {
    title: '제3조 (약관의 효력 및 변경)',
    content: `① 본 약관은 서비스 화면에 게시하거나 이용자에게 공지함으로써 효력이 발생합니다.
② 서비스는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.
③ 약관이 변경되는 경우 서비스는 변경 사항을 최소 7일 전에 공지합니다. 중요한 변경의 경우 30일 전에 공지합니다.`,
  },
  {
    title: '제4조 (서비스 이용 계약)',
    content: `① 이용 계약은 이용자가 본 약관에 동의하고 회원가입을 완료함으로써 성립됩니다.
② 서비스는 다음 각 호에 해당하는 경우 가입 신청을 거부하거나 사후에 이용 계약을 해지할 수 있습니다.
   - 타인의 명의를 사용하여 신청한 경우
   - 허위 정보를 기재한 경우
   - 서비스의 정상적인 운영을 방해하거나 방해할 우려가 있는 경우`,
  },
  {
    title: '제5조 (개인정보 보호)',
    content: `① 서비스는 이용자의 개인정보를 관련 법령 및 개인정보처리방침에 따라 보호합니다.
② 서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.
③ 자세한 사항은 별도의 개인정보처리방침을 통해 확인하실 수 있습니다.`,
  },
  {
    title: '제6조 (서비스 요금 및 결제)',
    content: `① 무료 플랜은 별도의 결제 없이 이용할 수 있습니다.
② 유료 플랜(Pro, Premium)의 요금 및 결제 방식은 서비스 내 요금제 안내 페이지를 따릅니다.
③ 유료 서비스는 월간 구독 방식으로 운영되며, 이용자가 구독을 해지하지 않는 한 자동 갱신됩니다.
④ 환불은 결제일로부터 7일 이내에 서비스를 이용하지 않은 경우에 한하여 전액 환불됩니다. 이용 이력이 있는 경우 환불이 제한될 수 있습니다.`,
  },
  {
    title: '제7조 (이용자의 의무)',
    content: `이용자는 다음 행위를 해서는 안 됩니다.
① 타인의 계정을 도용하거나 허위 정보를 등록하는 행위
② 서비스의 저작권, 특허권 등 지식재산권을 침해하는 행위
③ 서비스의 안정적인 운영을 방해하는 행위 (과도한 트래픽 유발 등)
④ 서비스를 이용하여 타인에게 해를 끼치는 행위
⑤ 관련 법령에 위반되는 행위`,
  },
  {
    title: '제8조 (콘텐츠의 권리)',
    content: `① 이용자가 서비스 내에 등록한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.
② 이용자는 서비스가 콘텐츠를 서비스 제공 목적 범위 내에서 저장, 처리, 표시할 수 있음에 동의합니다.
③ 서비스는 이용자의 동의 없이 콘텐츠를 외부에 공개하거나 제3자에게 제공하지 않습니다.`,
  },
  {
    title: '제9조 (서비스의 변경 및 중단)',
    content: `① 서비스는 운영상, 기술상의 필요에 따라 서비스의 내용을 변경하거나 일시 중단할 수 있습니다.
② 서비스는 중단 7일 전에 이용자에게 공지합니다. 단, 불가피한 사유가 있는 경우 사후 공지할 수 있습니다.
③ 서비스의 변경 또는 중단으로 인해 발생한 손해에 대해 서비스는 관련 법령이 정하는 한도 내에서 책임을 집니다.`,
  },
  {
    title: '제10조 (면책조항)',
    content: `① 서비스는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 인한 서비스 장애에 대해 책임을 지지 않습니다.
② 이용자가 서비스를 이용하여 기대하는 수업 성과나 진도 결과를 얻지 못한 것에 대해 서비스는 책임을 지지 않습니다.
③ AI가 생성한 재계획 및 제안 사항은 참고용이며, 최종 판단은 이용자(교사)에게 있습니다.`,
  },
  {
    title: '제11조 (준거법 및 분쟁 해결)',
    content: `① 본 약관은 대한민국 법령에 따라 해석 및 적용됩니다.
② 서비스 이용과 관련하여 분쟁이 발생한 경우 서비스와 이용자는 상호 협의를 통해 해결하도록 노력합니다.
③ 협의가 이루어지지 않을 경우 관할 법원은 민사소송법에 따른 법원으로 합니다.`,
  },
]

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">이용약관</h1>
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
          <p className="text-sm text-[#6B7280]">약관에 관한 문의는 서비스 내 문의하기를 이용해 주세요.</p>
          <a href="/" className="inline-block mt-6 text-[13px] font-semibold text-[#0052FF] hover:underline">← 홈으로 돌아가기</a>
        </div>
      </main>

      <footer className="border-t border-[#E5E7EB] py-8 text-center text-[11px] text-[#6B7280]">
        © 2026 ClassFlow. All rights reserved.
      </footer>
    </div>
  )
}
