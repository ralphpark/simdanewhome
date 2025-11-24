import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Portfolio } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function PortfolioPage() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: portfolios, isLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
  });

  const categories = portfolios
    ? ["all", ...new Set(portfolios.map((p) => p.category))]
    : ["all"];

  const filteredPortfolios = portfolios?.filter(
    (portfolio) => selectedCategory === "all" || portfolio.category === selectedCategory
  );

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            포트폴리오
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            SIMDA의 프로젝트 사례를 만나보세요
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover-elevate active-elevate-2 px-4 py-2"
                data-testid={`filter-${category}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "전체" : category}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredPortfolios && filteredPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPortfolios.map((portfolio) => (
                <Card
                  key={portfolio.id}
                  data-testid={`portfolio-card-${portfolio.id}`}
                  className="overflow-hidden hover-elevate cursor-pointer"
                  onClick={() => setSelectedPortfolio(portfolio)}
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {portfolio.thumbnailUrl && (
                      <img
                        src={portfolio.thumbnailUrl}
                        alt={portfolio.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                    {portfolio.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary">추천</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline">{portfolio.category}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{portfolio.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {portfolio.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">등록된 포트폴리오가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedPortfolio} onOpenChange={() => setSelectedPortfolio(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedPortfolio && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPortfolio.title}</DialogTitle>
                <DialogDescription>
                  <Badge variant="outline" className="mr-2">{selectedPortfolio.category}</Badge>
                  {selectedPortfolio.completedDate && (
                    <span className="text-sm">
                      {format(new Date(selectedPortfolio.completedDate), "yyyy년 MM월", { locale: ko })}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                  {selectedPortfolio.images.map((imageUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${selectedPortfolio.title} - ${index + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">프로젝트 설명</h3>
                      <p className="text-muted-foreground">{selectedPortfolio.description}</p>
                    </div>
                    {selectedPortfolio.clientName && (
                      <div>
                        <h3 className="font-semibold mb-2">클라이언트</h3>
                        <p className="text-muted-foreground">{selectedPortfolio.clientName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
