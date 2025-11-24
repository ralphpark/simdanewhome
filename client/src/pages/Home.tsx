import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Leaf, MessageSquare, Calendar, Sprout, ExternalLink, ShoppingBag, BookOpen, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Portfolio, Post } from "@shared/schema";

export default function Home() {
  const { data: portfolios } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
  });

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const latestPortfolios = portfolios?.slice(0, 3) || [];
  const latestPosts = posts?.slice(0, 3) || [];

  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/5 overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 text-center">
          {/* 헤더 애니메이션 */}
          <div className="mb-12 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/50 border border-primary/20 mb-6">
              <Leaf className="h-4 w-4 text-primary animate-bounce" style={{animationDelay: '0.2s'}} />
              <span className="text-sm font-medium text-primary">SIMDA와 함께 시작하기</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              식물과 함께하는<br />
              <span className="text-foreground">더 나은 공간</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              AI 큐레이션으로 당신의 환경에 완벽한 식물을 찾아드립니다.<br />
              <span className="text-foreground font-medium">SIMDA와 함께 자연을 일상으로 초대하세요.</span>
            </p>
          </div>

          {/* 선택 카드들 - Glass Morphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div data-testid="card-choice-buy" className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative backdrop-blur-xl bg-white/40 border border-white/60 shadow-xl rounded-2xl p-8 hover-elevate transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                <ShoppingBag className="h-14 w-14 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-3">식물을 사고 싶으신가요?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  엄선된 프리미엄 식물을<br />안전하게 배송받으세요
                </p>
                <a href="https://simgo.kr/" target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-shop" className="w-full gap-2 bg-primary hover:bg-primary/90">
                    온라인샵 바로가기
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            <div data-testid="card-choice-manage" className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative backdrop-blur-xl bg-white/40 border border-white/60 shadow-xl rounded-2xl p-8 hover-elevate transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                <Leaf className="h-14 w-14 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-3">관리하고 싶으신가요?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  AI 추천과 구독 관리<br />서비스를 경험하세요
                </p>
                <Link href="/services#ai-curation">
                  <Button data-testid="button-ai-curation" variant="outline" className="w-full border-white/40 hover:bg-white/20">
                    AI 큐레이션 시작하기
                  </Button>
                </Link>
              </div>
            </div>

            <div data-testid="card-choice-learn" className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative backdrop-blur-xl bg-white/40 border border-white/60 shadow-xl rounded-2xl p-8 hover-elevate transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                <BookOpen className="h-14 w-14 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-3">배우고 싶으신가요?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  전문가의 식물 케어<br />교육 프로그램
                </p>
                <Link href="/services#education">
                  <Button data-testid="button-education" variant="outline" className="w-full border-white/40 hover:bg-white/20">
                    교육 프로그램 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* CTA 스크롤 표시 */}
          <div className="mt-20 flex justify-center">
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-primary/50 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">주요 서비스</h2>
            <p className="text-muted-foreground">SIMDA가 제공하는 프리미엄 서비스</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="service-card-ai">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI 식물 큐레이션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI가 당신의 환경과 취향을 분석하여 최적의 식물을 추천합니다
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/services#ai-curation">
                  <Button variant="ghost" size="sm" data-testid="button-learn-ai" className="gap-2">
                    자세히 보기 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card data-testid="service-card-subscription">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>구독 관리 서비스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  정기적인 식물 배송과 전문가의 관리 팁을 받아보세요
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/services#subscription">
                  <Button variant="ghost" size="sm" data-testid="button-learn-subscription" className="gap-2">
                    자세히 보기 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card data-testid="service-card-education">
              <CardHeader>
                <Sprout className="h-10 w-10 text-primary mb-2" />
                <CardTitle>식물 콘텐츠 교육</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  초급부터 고급까지, 체계적인 식물 케어 교육 프로그램
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/services#education">
                  <Button variant="ghost" size="sm" data-testid="button-learn-education" className="gap-2">
                    자세히 보기 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card data-testid="service-card-marketplace">
              <CardHeader>
                <Building2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>지역 기반 입찰</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI 추천 식물을 주변 판매자들이 경쟁 입찰로 제안합니다
                </p>
              </CardContent>
              <CardFooter>
                <a href="https://simda.me/" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" data-testid="button-learn-marketplace" className="gap-2">
                    바로가기 <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {latestPortfolios.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">최신 포트폴리오</h2>
                <p className="text-muted-foreground">SIMDA의 프로젝트 사례를 확인하세요</p>
              </div>
              <Link href="/portfolio">
                <Button variant="outline" data-testid="button-view-all-portfolios" className="gap-2">
                  전체 보기 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPortfolios.map((portfolio) => (
                <Card key={portfolio.id} data-testid={`portfolio-card-${portfolio.id}`} className="overflow-hidden hover-elevate cursor-pointer">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {portfolio.thumbnailUrl && (
                      <img
                        src={portfolio.thumbnailUrl}
                        alt={portfolio.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{portfolio.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{portfolio.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">최신 매거진</h2>
                <p className="text-muted-foreground">식물과 관련된 다양한 콘텐츠를 만나보세요</p>
              </div>
              <Link href="/magazine">
                <Button variant="outline" data-testid="button-view-all-posts" className="gap-2">
                  전체 보기 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Card key={post.id} data-testid={`post-card-${post.id}`} className="overflow-hidden hover-elevate cursor-pointer">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {post.thumbnailUrl && (
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-md">
                        {post.category}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            기업 협업이 필요하신가요?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            SIMDA는 오피스, 상업 공간, 대규모 조경 프로젝트를 전문적으로 관리합니다
          </p>
          <Link href="/b2b">
            <Button
              size="lg"
              variant="outline"
              data-testid="button-b2b-inquiry"
              className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              B2B 협업 문의하기 <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
