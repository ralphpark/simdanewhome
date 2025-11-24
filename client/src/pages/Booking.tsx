import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, type InsertBooking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // URL에서 recommendation 파라미터 추출
  const getRecommendationFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("recommendation") || "";
  };

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      consultationType: "AI curation",
      preferredDate: new Date(),
      preferredTime: "",
      message: getRecommendationFromUrl(),
    },
  });

  // URL 파라미터 변경 시 message 필드 업데이트
  useEffect(() => {
    const recommendation = getRecommendationFromUrl();
    if (recommendation) {
      form.setValue("message", recommendation);
    }
  }, [location, form]);

  const createBooking = useMutation({
    mutationFn: (data: InsertBooking) => apiRequest("POST", "/api/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "예약이 완료되었습니다",
        description: "담당자가 확인 후 연락드리겠습니다.",
      });
      form.reset();
      setAgreedToTerms(false);
      setSelectedDate(undefined);
    },
    onError: () => {
      toast({
        title: "예약 실패",
        description: "예약 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBooking) => {
    if (!agreedToTerms) {
      toast({
        title: "개인정보 수집 동의가 필요합니다",
        variant: "destructive",
      });
      return;
    }
    createBooking.mutate(data);
  };

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            예약 · 상담
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            simda 전문가와 1:1 상담을 예약하세요
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <Card>
            <CardHeader>
              <CardTitle>상담 예약하기</CardTitle>
              <CardDescription>
                원하시는 서비스와 시간을 선택하시면 담당자가 연락드리겠습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이름 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="홍길동"
                              data-testid="input-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일 *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="simda@example.com"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>상담 유형 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-consultation-type">
                              <SelectValue placeholder="상담 유형을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AI curation">AI 식물 큐레이션</SelectItem>
                            <SelectItem value="subscription">구독 관리</SelectItem>
                            <SelectItem value="education">식물 교육</SelectItem>
                            <SelectItem value="B2B">기업 협업</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>희망 날짜 *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  data-testid="button-select-date"
                                  className="justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ko })
                                  ) : (
                                    <span>날짜를 선택하세요</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setSelectedDate(date);
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>희망 시간 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-time">
                                <SelectValue placeholder="시간을 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="10:00">10:00</SelectItem>
                              <SelectItem value="11:00">11:00</SelectItem>
                              <SelectItem value="14:00">14:00</SelectItem>
                              <SelectItem value="15:00">15:00</SelectItem>
                              <SelectItem value="16:00">16:00</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>문의 내용 *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="상담 받고 싶은 내용을 자세히 적어주세요"
                            data-testid="input-message"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      data-testid="checkbox-terms"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      개인정보 수집 및 이용에 동의합니다
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    data-testid="button-submit-booking"
                    className="w-full"
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? "예약 중..." : "예약하기"}
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
