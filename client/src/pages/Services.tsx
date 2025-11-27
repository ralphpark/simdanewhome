import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, BookOpen, TrendingUp, Sparkles, MapPin, Users, ExternalLink, BadgeCheck } from "lucide-react";
import { Link } from "wouter";
import plantCareImage from "@assets/generated_images/expert_plant_care_maintenance_service.png";
import educationImage from "@assets/generated_images/plant_content_education_program.png";
import aiCurationImage from "@assets/generated_images/ai_plant_curation_consultation_service.png";

export default function Services() {
  const handleChannelTalk = () => {
    if (typeof window !== "undefined" && (window as any).ChannelIO) {
      (window as any).ChannelIO("showMessenger");
    }
  };

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
              <p className="text-muted-foreground mb-6">당신의 환경과 취향을 분석하여 최적의 식물을 추천해드립니다. 특허받은  AI 기술로 대화형 상담을 통해 완벽한 식물을 찾아드립니다.</p>
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
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={aiCurationImage} 
                alt="AI 식물 큐레이션 서비스"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section id="subscription" className="py-20 bg-card">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square rounded-lg overflow-hidden order-2 md:order-1">
              <img 
                src={plantCareImage} 
                alt="식물 관리 서비스"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                식물 관리 서비스
              </h2>
              <p className="text-muted-foreground mb-6">
                전문가 팀이 당신의 식물을 정기적으로 방문하여 물주기, 영양관리, 병충해 관리 등 
                모든 케어를 책임지는 맞춤형 식물 관리 서비스입니다.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <h4 className="font-semibold mb-2">공기업</h4>
                    <p className="text-sm text-muted-foreground">쾌적한 업무환경 조성 케어</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <h4 className="font-semibold mb-2">사기업</h4>
                    <p className="text-sm text-muted-foreground">브랜드 가치 향상 케어</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <h4 className="font-semibold mb-2">개인</h4>
                    <p className="text-sm text-muted-foreground">가정의 건강한 식물 환경</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link href="/plant-care-consultation">
                  <Button data-testid="button-ai-plant-care" className="gap-2">
                    AI 식물관리사와 상담하기
                  </Button>
                </Link>
                <Button 
                  data-testid="button-contact-plant-care" 
                  onClick={handleChannelTalk}
                  variant="outline"
                >
                  채널톡으로 문의하기
                </Button>
                <Link href="/booking">
                  <Button variant="outline" data-testid="button-book-plant-care">
                    상담 예약하기
                  </Button>
                </Link>
              </div>
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
                공기업, 사기업, 교육기관 및 개인을 대상으로 한 맞춤형 식물 교육 프로그램을 제공합니다.
              </p>
              <div className="space-y-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">공기업/공공기관</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      직원 웰빙을 위한 직장 내 식물 관리 교육 및 사내 정원 운영 프로그램
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">사기업/상업시설</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      고객 만족도 향상을 위한 상업공간 식물 관리 전문 교육
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">교육기관</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      학생들을 위한 생태학 연계 교육 프로그램 및 원예 치료 프로그램
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">개인</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      가정에서의 체계적인 식물 관리법과 전문가 양성 과정
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Button 
                  data-testid="button-contact-education" 
                  onClick={handleChannelTalk}
                >
                  채널톡으로 문의하기
                </Button>
                <Link href="/booking">
                  <Button variant="outline" data-testid="button-book-education">
                    상담 예약하기
                  </Button>
                </Link>
              </div>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={educationImage} 
                alt="식물 콘텐츠 교육"
                className="w-full h-full object-cover"
              />
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
          </div>
        </div>
      </section>
    </div>
  );
}
