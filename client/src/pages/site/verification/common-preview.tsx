import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Subpage, PageHead, PageSection, PhotoReveal, SegmentedControl, Tiles, WaysCards } from "@/components/site/PagePrimitives";
import { FloatingInput, FloatingTextarea, SuccessCheck } from "@/components/site/AppleFields";
import { PlatformPhone } from "@/components/site/PlatformPhone";
import "@/index.css";
import "@/styles/tokens.css";
function Preview() {
  const [value, setValue] = useState("all");
  return <div className="site-shell"><Subpage><PageHead eyebrow="공통 부품 검수" title={<>초록으로 채우는<br />일상의 가능성.</>} intro={<>승인된 홈의 <b>글자와 간격, 사진과 움직임.</b></>} imageKey="services.platform" actions={<a className="btn" href="#preview">더 알아보기</a>} />
    <PageSection id="preview" title="같은 언어로 이어지는 화면." alt><SegmentedControl options={[{key:"all",label:"전체"},{key:"care",label:"식물관리"}]} value={value} onChange={setValue} label="검수 필터" /><PhotoReveal src="/images/home/plant-studio.jpg" alt="식물이 있는 공간" /></PageSection>
    <PageSection title="가까워서 더 따뜻한 선물."><PlatformPhone /></PageSection>
    <PageSection title="공간의 기록."><Tiles items={[{id:"one",href:"/portfolio",title:"식물이 머무는 공간",image:"/images/home/work1.jpg"},{id:"two",href:"/portfolio",title:"함께 만드는 일상",image:"/images/home/work2.jpg"}]} /></PageSection>
    <PageSection title="첫 대화를 시작해 보세요." alt><FloatingInput label="이름" /><FloatingTextarea label="메시지" /><SuccessCheck /></PageSection><WaysCards /></Subpage></div>;
}
createRoot(document.getElementById("root")!).render(<QueryClientProvider client={new QueryClient()}><Preview /></QueryClientProvider>);
