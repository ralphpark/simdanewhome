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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlNWU3ZWIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTJjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEyYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0yNC0yNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xMmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHpNMTIgMjJjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTJjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTI0IDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              식물과 함께하는<br />더 나은 공간
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              AI 큐레이션으로 당신에게 완벽한 식물을 찾아드립니다.<br />
              SIMDA와 함께 자연을 일상으로 초대하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card data-testid="card-choice-buy" className="hover-elevate active-elevate-2 cursor-pointer border-2">
              <CardHeader>
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-xl">식물을 사고 싶으신가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  엄선된 식물을 안전하게 배송받으세요
                </p>
                <a href="https://simgo.kr/" target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-shop" className="w-full gap-2">
                    온라인샵 바로가기
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card data-testid="card-choice-manage" className="hover-elevate active-elevate-2 cursor-pointer border-2">
              <CardHeader>
                <Leaf className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-xl">관리하고 싶으신가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  AI 추천과 구독 관리 서비스
                </p>
                <Link href="/services#ai-curation">
                  <Button data-testid="button-ai-curation" variant="outline" className="w-full">
                    AI 큐레이션 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-choice-learn" className="hover-elevate active-elevate-2 cursor-pointer border-2">
              <CardHeader>
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-xl">배우고 싶으신가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  전문가의 식물 케어 교육
                </p>
                <Link href="/services#education">
                  <Button data-testid="button-education" variant="outline" className="w-full">
                    교육 프로그램 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
