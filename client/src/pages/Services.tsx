import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, BookOpen, TrendingUp, Sparkles, MapPin, Users, ExternalLink, BadgeCheck } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            서비스 소개
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            simda의 프리미엄 식물 관리 서비스
          </p>
        </div>
      </section>

      <section id="ai-curation" className="py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">AI 기술</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                AI 식물 큐레이션
              </h2>
              <p className="text-muted-foreground mb-6">
                당신의 환경과 취향을 분석하여 최적의 식물을 추천해드립니다. 
                Google Gemini AI 기술로 대화형 상담을 통해 완벽한 식물을 찾아드립니다.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">환경 분석</h4>
                    <p className="text-sm text-muted-foreground">실내/실외, 햇빛, 습도, 공간 크기 파악</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">경험 수준 확인</h4>
                    <p className="text-sm text-muted-foreground">초보부터 고급까지 맞춤 추천</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">스타일 선호도</h4>
                    <p className="text-sm text-muted-foreground">관엽/다육/허브/꽃/공기정화 식물 중 선택</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link href="/ai-curation">
                  <Button data-testid="button-shop-ai" className="gap-2">
                    AI 식물큐레이션 진행하기
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button variant="outline" data-testid="button-book-ai">
                    상담 예약하기
                  </Button>
                </Link>
              </div>
            </div>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <MessageSquare className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      <section id="subscription" className="py-20 bg-card">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center order-2 md:order-1">
              <Calendar className="h-24 w-24 text-muted-foreground" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                식물 구독 관리 서비스
              </h2>
              <p className="text-muted-foreground mb-6">
                정기적으로 새로운 식물을 받아보고, 전문가의 관리 팁과 함께 
                당신의 식물 컬렉션을 키워나가세요.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">베이직 플랜</h4>
                    <p className="text-2xl font-bold text-primary mb-2">월 29,000원</p>
                    <p className="text-sm text-muted-foreground">월 1회 식물 배송</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">프리미엄 플랜</h4>
                    <p className="text-2xl font-bold text-primary mb-2">월 59,000원</p>
                    <p className="text-sm text-muted-foreground">월 2회 + 관리 서비스</p>
                  </CardContent>
                </Card>
              </div>
              <Button data-testid="button-contact-subscription" className="w-full md:w-auto">
                채널톡으로 문의하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="education" className="py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                식물 콘텐츠 교육
              </h2>
              <p className="text-muted-foreground mb-8">
                초급부터 고급까지, 체계적인 식물 관리 교육 프로그램을 제공합니다.
              </p>
              <div className="space-y-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">초급 과정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      기본적인 식물 관리법, 물주기, 빛 관리
                    </p>
                    <p className="text-sm font-semibold">2주 과정 | 150,000원</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">중급 과정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      분갈이, 병충해 관리, 번식법
                    </p>
                    <p className="text-sm font-semibold">4주 과정 | 280,000원</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">고급 과정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      희귀 식물 관리, 전문가 양성 과정
                    </p>
                    <p className="text-sm font-semibold">8주 과정 | 500,000원</p>
                  </CardContent>
                </Card>
              </div>
              <Button data-testid="button-contact-education" className="w-full md:w-auto">
                채널톡으로 문의하기
              </Button>
            </div>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      <section id="marketplace" className="py-20 bg-card">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">신규 서비스</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              AI 추천 지역 입찰 마켓플레이스
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
              AI가 추천한 당신에게 딱 맞는 식물을, 우리 동네 판매자들이 경쟁 입찰로 제안합니다. 
              가장 좋은 조건으로 신선한 식물을 만나보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">1. AI 식물 추천</h4>
                <p className="text-sm text-muted-foreground">
                  환경과 취향 분석 후 최적의 식물 3-5종 추천
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">2. 지역 판매자 매칭</h4>
                <p className="text-sm text-muted-foreground">
                  내 주변 5km 이내 판매자 자동 검색
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">3. 실시간 입찰</h4>
                <p className="text-sm text-muted-foreground">
                  24시간 이내 가격과 조건 제시
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <BadgeCheck className="h-10 w-10 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">4. 최적 선택</h4>
                <p className="text-sm text-muted-foreground">
                  가격, 거리, 평점 비교 후 구매
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-accent/20 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-bold mb-6">주요 특징</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI 맞춤 추천</h4>
                  <p className="text-sm text-muted-foreground">내게 딱 맞는 식물만</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">지역 기반 매칭</h4>
                  <p className="text-sm text-muted-foreground">내 주변 5km 이내 판매자</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">경쟁 입찰</h4>
                  <p className="text-sm text-muted-foreground">더 좋은 가격으로</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">신뢰 시스템</h4>
                  <p className="text-sm text-muted-foreground">평점과 리뷰 확인</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <a href="https://simda.me/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" data-testid="button-marketplace-start" className="gap-2">
                AI 추천 받고 입찰 시작하기
                <ExternalLink className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://simda.me/about" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" data-testid="button-marketplace-learn" className="gap-2">
                서비스 자세히 알아보기
                <ExternalLink className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
