import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => (
  <footer className="border-t border-surface-border">
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        {/* Left */}
        <div>
          <Logo size={24} />
          <p className="text-xs text-muted-foreground font-body mt-2">Mutual fund fee audit & portfolio intelligence.</p>
        </div>

        {/* Links grid */}
        <div className="flex flex-col sm:flex-row gap-12 sm:gap-24 text-xs font-body">
          <div className="flex flex-col gap-4">
            <span className="text-foreground font-semibold uppercase tracking-wider text-[10px]">Product</span>
            <a href="#fee-calculator" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Fee Audit</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Pricing</a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-foreground font-semibold uppercase tracking-wider text-[10px]">Resources</span>
            <Link to="/learn-drift" className="text-muted-foreground hover:text-foreground transition-colors duration-200">How It Works</Link>
            <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Help Center</Link>
            <a href="https://quantr.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5">
              <span>Quantr Terminal</span>
              <span className="text-[10px] opacity-50">↗</span>
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-foreground font-semibold uppercase tracking-wider text-[10px]">Legal</span>
            <Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Security & Trust</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* SEBI Disclaimer & Copyright */}
      <div className="border-t border-surface-border mt-8 pt-6 space-y-3">
        <p className="text-[10px] text-muted-foreground/50 font-body leading-relaxed max-w-4xl">
          Ratio x is not a SEBI-registered Investment Adviser (IA), Research Analyst (RA), or Portfolio Manager. 
          The platform is an educational portfolio tracking and fee analysis tool and does not provide investment, trading, or tax advice. 
          All information including fee calculations, TER comparisons, and savings projections are for informational purposes only. Users should consult qualified professionals before making financial decisions.
        </p>
        <p className="text-[10px] text-muted-foreground/40 font-body leading-relaxed max-w-4xl">
          All product names, logos, and brands are property of their respective owners. Use of these names, logos, and brands does not imply endorsement or affiliation.
        </p>
        <p className="text-xs text-muted-foreground font-body">© {new Date().getFullYear()} Ratio x. Mutual fund fee audit & portfolio intelligence.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
