import { HomeSections } from "./home/sections";
import { usePageTitle } from "./portfolio/ui";
import { copy } from "@/content/copy";
import "./home/home.css";

export default function Home() {
  usePageTitle(copy.seo["/"].title);
  return <HomeSections />;
}
