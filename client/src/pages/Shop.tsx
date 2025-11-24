import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Package, Truck, CreditCard, ShieldCheck, Leaf } from "lucide-react";
export default function Shop() {

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <Leaf className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            simda 온라인샵
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            엄선된 식물을 안전하게 배송받으세요
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="https://simgo.kr/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" data-testid="button-goto-shop" className="gap-2">
                온라인샵 바로가기
                <ExternalLink className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            온라인샵 주요 특징
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card data-testid="feature-variety">
              <CardContent className="pt-6 text-center">
                <Package className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">다양한 식물</h3>
                <p className="text-sm text-muted-foreground">
                  관엽식물부터 다육식물까지 다양한 선택
                </p>
              </CardContent>
            </Card>

            <Card data-testid="feature-packing">
              <CardContent className="pt-6 text-center">
                <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">안전한 포장</h3>
                <p className="text-sm text-muted-foreground">
                  식물이 건강하게 배송되도록 특수 포장
                </p>
              </CardContent>
            </Card>

            <Card data-testid="feature-payment">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">편리한 결제</h3>
                <p className="text-sm text-muted-foreground">
                  다양한 결제 방법 지원
                </p>
              </CardContent>
            </Card>

            <Card data-testid="feature-delivery">
              <CardContent className="pt-6 text-center">
                <Truck className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">빠른 배송</h3>
                <p className="text-sm text-muted-foreground">
                  주문 후 2-3일 내 배송
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-accent/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">
                  새 탭에서 simda 온라인샵이 열립니다
                </h3>
                <p className="text-muted-foreground mb-6">
                  전국 어디서나 주문 가능한 공식 쇼핑몰 simgo.kr
                </p>
                <a href="https://simgo.kr/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" data-testid="button-shop-main" className="gap-2">
                    <ExternalLink className="h-5 w-5" />
                    simgo.kr 바로가기
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
