import { db } from "./db";
import * as schema from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if we already have data
  const existingPortfolios = await db.query.portfolios.findMany();
  if (existingPortfolios.length > 0) {
    console.log("✅ Database already seeded");
    return;
  }

  // Seed portfolios
  const portfolios = await db.insert(schema.portfolios).values([
    {
      title: "강남 오피스 그린 인테리어",
      description: "500평 규모의 IT 기업 사무실 전체 식물 디자인 및 관리 프로젝트",
      category: "Office",
      clientName: "테크컴퍼니",
      completedDate: new Date("2024-03-15"),
      thumbnailUrl: "https://placehold.co/800x600/22c55e/ffffff?text=Office+Plants",
      images: [
        "https://placehold.co/1200x800/22c55e/ffffff?text=Office+1",
        "https://placehold.co/1200x800/22c55e/ffffff?text=Office+2",
      ],
      featured: true,
    },
    {
      title: "한남동 레지던스 베란다 가든",
      description: "30평 베란다를 활용한 프라이빗 가든 조성",
      category: "Residential",
      clientName: "김OO",
      completedDate: new Date("2024-02-20"),
      thumbnailUrl: "https://placehold.co/800x600/10b981/ffffff?text=Residence+Garden",
      images: [
        "https://placehold.co/1200x800/10b981/ffffff?text=Residence+1",
        "https://placehold.co/1200x800/10b981/ffffff?text=Residence+2",
      ],
      featured: false,
    },
    {
      title: "압구정 카페 식물 큐레이션",
      description: "북유럽 감성의 카페 전체 식물 디스플레이 및 관리",
      category: "Commercial",
      clientName: "그린카페",
      completedDate: new Date("2024-01-10"),
      thumbnailUrl: "https://placehold.co/800x600/14b8a6/ffffff?text=Cafe+Plants",
      images: [
        "https://placehold.co/1200x800/14b8a6/ffffff?text=Cafe+1",
        "https://placehold.co/1200x800/14b8a6/ffffff?text=Cafe+2",
      ],
      featured: true,
    },
  ]).returning();

  console.log(`✅ Created ${portfolios.length} portfolios`);

  // Seed posts
  const posts = await db.insert(schema.posts).values([
    {
      title: "초보자를 위한 겨울철 식물 관리 가이드",
      content: "# 겨울철 식물 관리의 모든 것\n\n난방으로 인한 건조함, 부족한 일조량... 겨울은 식물에게 힘든 계절입니다.\n\n## 온도 관리\n실내 온도는 18-22도를 유지하고, 찬바람이 직접 닿지 않도록 주의하세요.\n\n## 물주기\n겨울에는 식물의 성장이 느려지므로 물을 주는 횟수를 줄여야 합니다.",
      excerpt: "난방으로 건조해진 실내에서 식물을 건강하게 유지하는 방법을 알려드립니다.",
      thumbnailUrl: "https://placehold.co/1200x630/22c55e/ffffff?text=Winter+Care",
      category: "Plant Care",
      tags: ["겨울", "관리", "초보"],
      author: "SIMDA Team",
      published: true,
    },
    {
      title: "실내 공기정화 식물 BEST 10",
      content: "# 실내 공기를 맑게 해주는 식물들\n\n미세먼지와 각종 오염물질로 가득한 실내 공기, 식물의 힘으로 깨끗하게 만들어보세요.\n\n## 1. 산세베리아\nNASA가 인정한 공기정화 식물 1위!\n\n## 2. 스파티필름\n포름알데히드 제거에 탁월합니다.",
      excerpt: "NASA가 선정한 공기정화 식물부터 키우기 쉬운 품종까지 소개합니다.",
      thumbnailUrl: "https://placehold.co/1200x630/10b981/ffffff?text=Air+Purifying",
      category: "Plant Care",
      tags: ["공기정화", "추천", "실내"],
      author: "SIMDA Team",
      published: true,
    },
    {
      title: "강남 오피스 프로젝트 비하인드 스토리",
      content: "# 500평 오피스 그린 프로젝트\n\n최근 완료한 강남 테크 기업의 오피스 그린 인테리어 프로젝트를 소개합니다.\n\n## 프로젝트 개요\n- 규모: 500평\n- 기간: 2개월\n- 식물 종류: 30가지 이상",
      excerpt: "IT 기업 사무실을 식물 천국으로 변신시킨 프로젝트 스토리",
      thumbnailUrl: "https://placehold.co/1200x630/14b8a6/ffffff?text=Office+Project",
      category: "Project Story",
      tags: ["오피스", "프로젝트", "사례"],
      author: "SIMDA Team",
      published: true,
    },
  ]).returning();

  console.log(`✅ Created ${posts.length} posts`);

  console.log("🎉 Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
