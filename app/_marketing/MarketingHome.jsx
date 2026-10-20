import "./marketing.css";
import MarketingNavigation from "./components/MarketingNavigation.jsx";
import HeroSection from "./components/HeroSection.jsx";
import BrandStory from "./components/BrandStory.jsx";
import PricingSection from "./components/PricingSection.jsx";
import { FounderSection, SiteFooter } from "./components/FounderSection.jsx";

export default function MarketingHome({ account }) {
  return (
    <div className="marketing-site">
      <MarketingNavigation account={account} />
      <main className="main-content">
        <div className="content-card">
          <HeroSection />
          <BrandStory />
          <PricingSection />
          <FounderSection />
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
