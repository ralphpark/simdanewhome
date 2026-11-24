import { Subpage } from "@/components/site/PagePrimitives";
import { usePageTitle } from "./portfolio/ui";
import { StoryOpening, StoryPhilosophy, StoryTimeline, StoryRecognition, StoryClosing } from "./story/sections";
import "./story/story.css";

export default function Story() {
  usePageTitle("브랜드 스토리 | 심다");
  return <Subpage className="story-page"><StoryOpening /><StoryPhilosophy /><StoryTimeline /><StoryRecognition /><StoryClosing /></Subpage>;
}
