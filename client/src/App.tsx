import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Booking from "@/pages/Booking";
import Portfolio from "@/pages/Portfolio";
import Magazine from "@/pages/Magazine";
import B2B from "@/pages/B2B";
import Shop from "@/pages/Shop";
import Support from "@/pages/Support";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/booking" component={Booking} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/magazine" component={Magazine} />
      <Route path="/b2b" component={B2B} />
      <Route path="/shop" component={Shop} />
      <Route path="/support" component={Support} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatbotProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
            <AIChatbot />
          </div>
          <Toaster />
        </ChatbotProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
