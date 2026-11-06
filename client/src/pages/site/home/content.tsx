import { Link } from "wouter";
import type { CSSProperties } from "react";
import { clientLogoTracks } from "@/content/clientLogos";
import { useSiteImage } from "@/hooks/useSiteImage";
import { categoryLabel, usePortfolios } from "../portfolio/data";
import { newestPosts, postDate, usePosts } from "../magazine/data";

export function HomeWork() {
  const { data = [] } = usePortfolios();
  const office = useSiteImage("home.work2");
  const bakery = useSiteImage("home.work3");
  const museum = useSiteImage("home.story");
  const fallback = [
    { title: "캘러웨이 코리아", description: "사옥 식물 연출과 유지관리 · 2020–현재", image: office },
    { title: "헤이즈밀 베이커리", description: "매장 식물 연출 · 2025", image: bakery },
    { title: "오페라박물관", description: "조경 디자인 및 시공 · 2025", image: museum },
  ];
  const selected = [...data].sort((a, b) => Number(b.featured) - Number(a.featured) || (Date.parse(b.completedDate || "") || 0) - (Date.parse(a.completedDate || "") || 0)).slice(0, 3);
  return <section className="wk" id="work" aria-label="심다의 작업">
    <div className="wk-head center"><p className="t-eye rv">포트폴리오</p><h2 className="t-hero rv">공간이 달라졌습니다.</h2></div>
    <div className="tiles">
      {fallback.map((item, index) => {
        const project = selected[index];
        const title = project?.title || item.title;
        const image = project?.thumbnailUrl || project?.images?.[0] || item.image.url;
        const year = project?.completedDate?.match(/^\d{4}/)?.[0];
        const description = project ? `${categoryLabel(project.category)}${year ? ` · ${year}` : ""}` : item.description;
        return <Link className="tile" key={project?.id || item.title} href={project ? `/portfolio/${encodeURIComponent(project.id)}` : "/portfolio"}>
          <img src={image} alt={project ? title : item.image.alt} onError={event => { if (event.currentTarget.getAttribute("src") !== item.image.url) event.currentTarget.src = item.image.url; }} />
          <div className="tile-sh" /><div className="tile-tx"><h3>{title}</h3><p>{description}</p><span>자세히 보기 ›</span></div>
        </Link>;
      })}
      <Link className="tile tile-g" href="/portfolio"><div className="tile-tx"><h3>100곳이 넘는 공간.</h3><p>사옥, 매장, 박물관, 병원까지.</p><span>포트폴리오 전체 보기 ›</span></div></Link>
    </div>
  </section>;
}

export function HomeClients() {
  return <section className="cli" aria-label="함께한 곳"><p className="cli-l">함께한 곳</p><div className="mq-box">
    {clientLogoTracks.map(({ logos, duration, mobileDuration }, index) => <div key={index} className={`mq-row${index ? " mq-rev" : ""}`} style={{ "--mq-duration": `${duration}s`, "--mq-mobile-duration": `${mobileDuration}s` } as CSSProperties}>
      {[0, 1].map(copy => <div className="mq-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
        {logos.map(logo => <img key={logo.file} className="mq-logo" src={logo.file} alt={logo.name} width={logo.w} height={logo.h} decoding="async" style={{ "--mq-w": `${logo.w}px`, "--mq-h": `${logo.h}px` } as CSSProperties} />)}
      </div>)}
    </div>)}
  </div></section>;
}

export function HomeMagazine() {
  const { data = [] } = usePosts();
  const posts = newestPosts(data).slice(0, 3);
  const gift = useSiteImage("home.gift");
  const hero = useSiteImage("home.hero");
  const care = useSiteImage("home.care");
  const fallback = [
    { title: "가을철 식물 관리 방법", category: "식물관리", image: gift },
    { title: "초보자를 위한 겨울철 식물 관리 가이드", category: "가이드", image: hero },
    { title: "실내 공기정화 식물 BEST 10", category: "가이드", image: care },
  ];
  return <section className="mag" id="magazine" aria-label="매거진"><div className="wide">
    <div className="row-h"><h2 className="t-h2 rv">매거진.</h2><Link className="lk" href="/magazine">전체 글 보기 ›</Link></div>
    <div className="mg">{fallback.map((item, index) => {
      const post = posts[index];
      const title = post?.title || item.title;
      const date = post ? new Date(postDate(post)) : null;
      const dateText = date && !Number.isNaN(date.getTime()) ? `${date.getFullYear()}년 ${date.getMonth() + 1}월` : "2025년 11월";
      return <Link className="mc" key={post?.id || item.title} href={post ? `/magazine/${encodeURIComponent(post.id)}` : "/magazine"}>
        <div className="mc-ph"><img src={post?.thumbnailUrl || item.image.url} alt="" onError={event => { if (event.currentTarget.getAttribute("src") !== item.image.url) event.currentTarget.src = item.image.url; }} /></div>
        <div className="mc-tx"><p className="mc-cat">{post?.category || item.category}</p><p className="mc-t">{title}</p><p className="mc-d">{dateText}</p></div>
      </Link>;
    })}</div>
  </div></section>;
}
