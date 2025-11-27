import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertB2bProposalSchema, type InsertB2bProposal, type Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, FileCheck, Download, Leaf } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import b2bCollaborationImage from "@assets/generated_images/b2b_corporate_collaboration_and_partnership.png";

export default function B2B() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const form = useForm<InsertB2bProposal>({
    resolver: zodResolver(insertB2bProposalSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      phone: "",
      email: "",
      businessField: "" as any,
      proposalContent: "",
    },
  });

  const createProposal = useMutation({
    mutationFn: (data: InsertB2bProposal) => apiRequest("POST", "/api/b2b-proposals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/b2b-proposals"] });
      toast({
        title: "제안이 접수되었습니다",
        description: "담당자가 검토 후 연락드리겠습니다.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "제안 접수 실패",
        description: "제안 접수 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertB2bProposal) => {
    createProposal.mutate(data);
  };

  const downloadDocument = (type: "company-intro" | "proposal-template") => {
    const doc = documents.find(d => d.type === type);
    if (doc) {
      window.open(doc.fileUrl, "_blank");
    } else {
      toast({
        title: "다운로드 불가",
        description: type === "company-intro" ? "회사소개서를 찾을 수 없습니다." : "제안서 양식을 찾을 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            B2B 협업
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            simda와 함께 비즈니스 공간을 특별하게 만드세요
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card data-testid="card-service-office">
              <CardHeader>
                <Building2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>오피스 식물 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  사무실, 로비, 회의실 등 업무 공간에 최적화된 식물 배치 및 정기 관리 서비스
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-service-commercial">
              <CardHeader>
                <Leaf className="h-10 w-10 text-primary mb-2" />
                <CardTitle>상업 공간 큐레이션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  카페, 레스토랑, 호텔 등 상업 공간의 브랜드 이미지를 높이는 식물 디자인
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-service-landscape">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>대규모 조경 프로젝트</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  건물 외부, 옥상정원, 공용 공간 등 대규모 조경 설계 및 시공
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                simda B2B 서비스의 특별함
              </h2>
              <ul className="space-y-4">
                {[
                  "전문가 팀의 맞춤형 컨설팅",
                  "공간 분석 및 최적의 식물 선정",
                  "정기적인 관리 및 교체 서비스",
                  "계절별 테마 변경 가능",
                  "식물 교육 프로그램 제공",
                  "24/7 긴급 대응 서비스",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <FileCheck className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={b2bCollaborationImage} 
                alt="simda B2B 협업 서비스"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">회사 소개서 다운로드</CardTitle>
              <CardDescription>
                simda의 B2B 서비스에 대한 자세한 정보를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button data-testid="button-download-company" className="gap-2" onClick={() => downloadDocument("company-intro")}>
                <Download className="h-4 w-4" />
                회사 소개서 (PDF)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기업 협업 제안하기</CardTitle>
              <CardDescription>
                협업 제안서를 보내주시면 담당자가 검토 후 연락드리겠습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>회사명 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(주)심다"
                              data-testid="input-company-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>담당자명 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="홍길동"
                              data-testid="input-contact-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연락처 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="010-1234-5678"
                              data-testid="input-phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이메일 *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@simda.kr"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessField"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사업 분야</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="IT, 금융, 서비스업 등"
                            data-testid="input-business-field"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proposalContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제안 내용 *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="협업하고 싶은 내용을 자세히 적어주세요"
                            data-testid="input-proposal-content"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    data-testid="button-submit-proposal"
                    className="w-full"
                    disabled={createProposal.isPending}
                  >
                    {createProposal.isPending ? "제안 접수 중..." : "제안하기"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
