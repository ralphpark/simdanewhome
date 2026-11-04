import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteLayout } from "@/components/site/SiteLayout";
import Home from "@/pages/site/Home";
import Story from "@/pages/site/Story";
import Services from "@/pages/site/Services";
import Portfolio from "@/pages/site/Portfolio";
import PortfolioDetail from "@/pages/site/PortfolioDetail";
import Magazine from "@/pages/site/Magazine";
import MagazineDetail from "@/pages/site/MagazineDetail";
import Support from "@/pages/site/Support";
import B2B from "@/pages/site/B2B";
import Booking from "@/pages/site/Booking";
import { SiteNotFound } from "@/pages/site/PlaceholderPage";
import NotFound from "@/pages/not-found";

const Admin = lazy(() => import("@/pages/Admin"));
const AICuration = lazy(() => import("@/pages/AICuration"));
const PlantCareConsultation = lazy(() => import("@/pages/PlantCareConsultation"));
const AdminEditPost = lazy(() => import("@/pages/AdminEditPost"));
const AdminPortfolios = lazy(() => import("@/pages/AdminPortfolios"));
const AdminTimelines = lazy(() => import("@/pages/AdminTimelines"));

function ShopRedirect() {
  useEffect(() => { window.location.replace("https://www.simda.me"); }, []);
  return <p className="p-8 text-center"><a href="https://www.simda.me">온라인샵으로 이동 중입니다 ↗</a></p>;
}

function Router() {
  const [location] = useLocation();
  const legacy = /^\/admin(?:\/|$)/.test(location) || location === "/ai-curation" || location === "/plant-care-consultation";
  if (legacy) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<p role="status" className="p-12 text-center">불러오는 중…</p>}>
            <Switch>
              <Route path="/admin" component={Admin} />
              <Route path="/ai-curation" component={AICuration} />
              <Route path="/plant-care-consultation" component={PlantCareConsultation} />
              <Route path="/admin/posts/new">{() => <AdminEditPost />}</Route>
              <Route path="/admin/posts/:id">{({ id }) => <AdminEditPost id={id} />}</Route>
              <Route path="/admin/portfolios/new" component={AdminPortfolios} />
              <Route path="/admin/portfolios/:id" component={AdminPortfolios} />
              <Route path="/admin/timelines/new" component={AdminTimelines} />
              <Route path="/admin/timelines/:id" component={AdminTimelines} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <SiteLayout>
      {/* The explicit location preserves the exiting page during the crossfade. */}
      <Switch location={location}>
        <Route path="/" component={Home} />
        <Route path="/story" component={Story} />
        <Route path="/services" component={Services} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/portfolio/:id">{({ id }) => <PortfolioDetail id={id} />}</Route>
        <Route path="/magazine" component={Magazine} />
        <Route path="/magazine/:id">{({ id }) => <MagazineDetail id={id} />}</Route>
        <Route path="/support" component={Support} />
        <Route path="/support/b2b" component={B2B} />
        <Route path="/support/booking" component={Booking} />
        <Route path="/about"><Redirect to="/story" replace /></Route>
        <Route path="/b2b"><Redirect to="/support/b2b" replace /></Route>
        <Route path="/booking"><Redirect to="/support/booking" replace /></Route>
        <Route path="/shop" component={ShopRedirect} />
        <Route component={SiteNotFound} />
      </Switch>
    </SiteLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
