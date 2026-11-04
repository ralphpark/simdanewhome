import { HomeHero, HomeNumbers, HomePlatform, HomeServices, HomeWork, HomeClients, HomeMagazine, HomeClosing } from "./home/sections";
import "./home/home.css";

export default function Home() {
  return <div className="a-home"><HomeHero /><HomeNumbers /><HomePlatform /><HomeServices /><HomeWork /><HomeClients /><HomeMagazine /><HomeClosing /></div>;
}
