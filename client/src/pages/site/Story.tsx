import { StoryOpening, StoryPhilosophy, StoryTimeline, StoryRecognition, StoryMedia, StoryClosing } from "./story/sections";
import "./story/story.css";

export default function Story() {
  return <div className="a-story"><StoryOpening /><StoryPhilosophy /><StoryTimeline /><StoryRecognition /><StoryMedia /><StoryClosing /></div>;
}
