import { Link } from "react-router-dom";

const Disclaimer = () => (
  <div className="border-t border-surface-border bg-surface/10 px-6 py-4 mt-12">
    <div className="max-w-6xl mx-auto">
      <p className="text-[10px] font-body text-muted-foreground/60 leading-relaxed max-w-4xl">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 mr-2">Disclaimer</span>
        Ratio x is an educational portfolio tracking and analysis tool. It does not provide investment, tax, or trading advice of any kind. 
        All information, calculations, and scenarios displayed are for informational and educational purposes only. 
        Ratio x is not a SEBI-registered investment advisor (IA), research analyst (RA), or portfolio manager. 
        Consult a SEBI-registered investment advisor or qualified Chartered Accountant before making any financial decisions. 
        Past performance does not indicate future results. Users assume full responsibility for their financial decisions.
        All product names, logos, and brands are property of their respective owners. Use of these names, logos, and brands does not imply endorsement or affiliation.
        {" "}
        <Link to="/terms" className="underline hover:text-foreground transition-colors">Terms</Link>
        {" · "}
        <Link to="/privacy" className="underline hover:text-foreground transition-colors">Privacy</Link>
      </p>
    </div>
  </div>
);

export default Disclaimer;
