import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeeCalculator from "@/components/FeeCalculator";
import ProblemStatement from "@/components/ProblemStatement";
import Features from "@/components/Features";
import ComparisonTable from "@/components/ComparisonTable";
import HowItWorks from "@/components/HowItWorks";
import DashboardPreview from "@/components/DashboardPreview";

import EarlyAccess from "@/components/EarlyAccess";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

/**
 * Landing page section flow (USP = Mutual Fund Fee Intelligence):
 * 1. Hero — "your MF is bleeding hidden fees" + fee audit mockup + social proof
 * 1.5 Supported Brokers - scrolling marquee for trust
 * 2. FeeCalculator — interactive proof (show the fee problem concretely)
 * 3. ProblemStatement — fee-focused data/metrics (₹3.2L+ hidden costs)
 * 4. Features — Fee Transparency FIRST, then Portfolio Intelligence
 * 5. ComparisonTable — fee features lead the comparison
 * 6. HowItWorks — 3 steps to fee transparency
 * 7. DashboardPreview — fee audit dashboard preview
 * 8. EarlyAccess — "Stop overpaying. Start auditing."
 * 9. FAQ — MF fee questions first
 * 10. Footer
 */
const Index = () => (
  <div className="min-h-screen bg-background">
    <Nav />
    <Hero />
    <FeeCalculator />
    <ProblemStatement />
    <Features />
    <ComparisonTable />
    <HowItWorks />
    <DashboardPreview />

    <EarlyAccess />
    <FAQ />
    <Footer />
  </div>
);

export default Index;
