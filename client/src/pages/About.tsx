import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Users, Target, Heart } from "lucide-react";
import aboutImage from "@assets/8-1 (1)_1764048850640.jpg";
import { useQuery } from "@tanstack/react-query";
import type { Timeline } from "@shared/schema";

export default function About() {
  const { data: timelines = [] } = useQuery<Timeline[]>({
    queryKey: ["/api/timelines"],
  });

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            브랜드 스토리
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            자연과 사람을 연결하는 simda의 이야기
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                식물로 더 나은 삶을
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  simda는 2017년, 도시 생활 속에서 자연과의 연결이 필요하다는 믿음으로 일산의 작은 식물가게에서 시작되었습니다.
                </p>
                <p>
                  우리는 단순히 식물을 판매하는 것이 아닌, 사람들이 식물과 함께 성장하고 
                  더 나은 공간에서 살아갈 수 있도록 돕는 것을 목표로 합니다.
                </p>
                <p>
                  AI 기술과 전문가의 노하우를 결합하여, 누구나 쉽게 식물을 키울 수 있는 
                  환경을 만들어가고 있습니다.
                </p>
              </div>
            </div>
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
              <img 
                src={aboutImage} 
                alt="simda 식물" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <Card data-testid="card-mission">
              <CardContent className="pt-6">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">우리의 미션</h3>
                <p className="text-sm text-muted-foreground">
                  모든 공간에 자연의 생명력을 더하여 사람들의 삶을 풍요롭게 만듭니다
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-vision">
              <CardContent className="pt-6">
                <Leaf className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">우리의 비전</h3>
                <p className="text-sm text-muted-foreground">
                  기술과 자연의 조화로 지속 가능한 도시 생활 문화를 선도합니다
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-value">
              <CardContent className="pt-6">
                <Heart className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">핵심 가치</h3>
                <p className="text-sm text-muted-foreground">
                  전문성, 혁신, 지속가능성, 그리고 고객과의 신뢰를 최우선으로 합니다
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-team">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">전문 팀</h3>
                <p className="text-sm text-muted-foreground">
                  식물학자, 디자이너, 기술자가 함께 최상의 서비스를 제공합니다
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card rounded-lg p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              simda의 차별점
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">AI</div>
                <h3 className="font-semibold mb-2">데이터 기반 추천</h3>
                <p className="text-sm text-muted-foreground">
                  수천 건의 성공 사례를 학습한 AI가 최적의 식물을 추천합니다
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <h3 className="font-semibold mb-2">완료된 프로젝트</h3>
                <p className="text-sm text-muted-foreground">
                  주거 공간부터 대형 사무실까지 다양한 프로젝트 경험
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <h3 className="font-semibold mb-2">지속적인 관리</h3>
                <p className="text-sm text-muted-foreground">
                  구독 서비스로 식물이 항상 건강하게 유지될 수 있도록 지원
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              회사 연혁
            </h2>
            <div className="space-y-3">
              {timelines.map((timeline, index) => (
                <div key={timeline.id} className="flex gap-4 items-start">
                  <div className="flex items-center gap-3 min-w-fit pt-1">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="text-sm font-bold text-primary min-w-[60px]">{timeline.year}</div>
                  </div>
                  <Card className="flex-1 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="py-3 px-4">
                      <p className="font-semibold text-sm mb-1">{timeline.title}</p>
                      <p className="text-xs text-muted-foreground">{timeline.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
