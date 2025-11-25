import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

const faqs = [
  {
    category: "AI 큐레이션",
    questions: [
      {
        q: "AI 식물 큐레이션은 어떻게 작동하나요?",
        a: "Google Gemini AI를 활용하여 고객님의 환경(실내/실외, 햇빛 조건, 습도 등), 경험 수준, 선호 스타일을 분석합니다. 수천 건의 성공 사례를 학습한 AI가 최적의 식물 3-5종을 추천해드립니다.",
      },
      {
        q: "AI 추천을 받으려면 어떻게 해야 하나요?",
        a: "우측 하단의 채팅 아이콘을 클릭하시면 AI 큐레이터와 대화를 시작하실 수 있습니다. 몇 가지 간단한 질문에 답변하시면 맞춤 추천을 받으실 수 있습니다.",
      },
      {
        q: "추천받은 식물을 어디서 구매하나요?",
        a: "AI가 추천한 식물은 simgo.kr 온라인샵에서 바로 구매하실 수 있습니다. 또는 simda.me에서 지역 판매자들의 경쟁 입찰을 통해 더 좋은 조건으로 구매하실 수 있습니다.",
      },
    ],
  },
  {
    category: "식물 관리 서비스",
    questions: [
      {
        q: "식물 관리 서비스란 무엇인가요?",
        a: "전문가 팀이 당신의 식물을 정기적으로 방문하여 물주기, 영양관리, 병충해 관리 등 모든 케어를 책임지는 맞춤형 서비스입니다. 공기업, 사기업, 개인을 위한 맞춤 플랜을 제공합니다.",
      },
      {
        q: "서비스를 신청하려면 어떻게 하나요?",
        a: "채널톡이나 상담 예약을 통해 당신의 식물 상태와 필요한 케어에 대해 상담해드린 후, 맞춤형 관리 플랜을 제시해드립니다.",
      },
      {
        q: "정기 관리는 얼마나 자주 이루어지나요?",
        a: "주 1회 또는 월 2회 방문하여 식물 상태를 점검하고, 필요에 따라 물주기, 잎 관리, 필요시 식물 교체까지 진행합니다. 자세한 스케줄은 상담 시 조정 가능합니다.",
      },
    ],
  },
  {
    category: "교육 프로그램",
    questions: [
      {
        q: "어떤 교육 프로그램이 있나요?",
        a: "기업을 대상으로 하는 맞춤형 식물 교육 프로그램과 개인을 위한 클래스101 온라인 수업을 제공합니다. 초보부터 고급까지 다양한 난이도의 프로그램이 있습니다.",
      },
      {
        q: "기업 교육 프로그램은 어떻게 신청하나요?",
        a: "채널톡이나 B2B 협업 페이지를 통해 문의해주시면, 귀사의 특성과 필요에 맞는 맞춤형 교육 프로그램을 제시해드립니다.",
      },
      {
        q: "개인 클래스101 수업은 어떻게 수강하나요?",
        a: "클래스101 플랫폼에서 simda의 식물 케어 강좌를 검색하여 원하시는 강의를 수강하실 수 있습니다. 언제 어디서나 자신의 페이스대로 학습 가능합니다.",
      },
    ],
  },
  {
    category: "B2B 협업",
    questions: [
      {
        q: "소규모 사무실도 B2B 서비스를 이용할 수 있나요?",
        a: "네, 규모와 상관없이 모든 기업 고객을 환영합니다. 소규모 사무실부터 대형 빌딩까지 맞춤 서비스를 제공합니다.",
      },
      {
        q: "계약 기간은 어떻게 되나요?",
        a: "일반적으로 1년 단위로 계약하며, 필요에 따라 단기 프로젝트도 가능합니다. 자세한 내용은 제안서를 보내주시면 상담해드립니다.",
      },
      {
        q: "정기 관리는 어떻게 이루어지나요?",
        a: "전문 관리사가 주 1회 또는 월 2회 방문하여 식물 상태를 점검하고, 물주기, 잎 관리, 필요시 교체까지 진행합니다.",
      },
    ],
  },
  {
    category: "배송 및 반품",
    questions: [
      {
        q: "배송 기간은 얼마나 걸리나요?",
        a: "온라인샵(simgo.kr) 주문 시 2-3일 내 배송되며, 제주도 및 도서산간 지역은 3-5일 소요될 수 있습니다.",
      },
      {
        q: "식물이 손상되어 도착했어요.",
        a: "배송 중 손상된 식물은 사진과 함께 고객센터로 연락주시면 즉시 교환해드립니다. 도착 후 3일 이내 신청 가능합니다.",
      },
      {
        q: "반품이 가능한가요?",
        a: "생물 특성상 단순 변심에 의한 반품은 어렵지만, 상품 하자나 오배송의 경우 전액 환불 또는 교환 가능합니다.",
      },
    ],
  },
  {
    category: "결제",
    questions: [
      {
        q: "어떤 결제 수단을 사용할 수 있나요?",
        a: "신용카드, 체크카드, 계좌이체, 네이버페이, 카카오페이 등 다양한 결제 수단을 지원합니다.",
      },
      {
        q: "할부가 가능한가요?",
        a: "네, 5만원 이상 구매 시 2-6개월 무이자 할부가 가능합니다. (카드사별 상이)",
      },
      {
        q: "현금영수증 발행이 되나요?",
        a: "네, 주문 시 현금영수증 발행을 선택하실 수 있으며, 구매 후에도 요청하시면 발행해드립니다.",
      },
    ],
  },
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            고객센터
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            자주 묻는 질문과 답변을 확인하세요
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card data-testid="contact-chat">
              <CardHeader className="text-center">
                <MessageCircle className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle>채널톡</CardTitle>
                <CardDescription>실시간 채팅 상담</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button data-testid="button-channeltalk" className="w-full">
                  채팅 시작하기
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="contact-phone">
              <CardHeader className="text-center">
                <Phone className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle>전화 상담</CardTitle>
                <CardDescription>평일 09:00-18:00</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a href="tel:02-1234-5678">
                  <Button variant="outline" data-testid="button-call" className="w-full">
                    02-1234-5678
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card data-testid="contact-email">
              <CardHeader className="text-center">
                <Mail className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle>이메일 문의</CardTitle>
                <CardDescription>24시간 접수</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a href="mailto:support@simda.kr">
                  <Button variant="outline" data-testid="button-email" className="w-full">
                    이메일 보내기
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="궁금한 내용을 검색하세요..."
                data-testid="input-search-faq"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-8">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`${categoryIndex}-${faqIndex}`}
                        data-testid={`faq-item-${categoryIndex}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                </p>
              </div>
            )}
          </div>

          <Card className="mt-12 bg-accent/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">
                  원하시는 답변을 찾지 못하셨나요?
                </h3>
                <p className="text-muted-foreground mb-6">
                  1:1 상담을 통해 자세히 안내해드리겠습니다
                </p>
                <Link href="/booking">
                  <Button size="lg" data-testid="button-goto-booking">
                    상담 예약하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
