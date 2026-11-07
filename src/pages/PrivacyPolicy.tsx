import { Link } from "react-router-dom";
import Nav from "@/components/Nav";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Nav />
    <main className="pt-28 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-[1px] bg-muted-foreground/30" />
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Legal
        </span>
      </div>

      <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground mb-4">
        Privacy Policy
      </h1>
      <p className="text-xs font-mono text-muted-foreground mb-12">Last updated: April 2026</p>

      <div className="space-y-10 text-sm font-body text-muted-foreground leading-relaxed">

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">1. Information We Collect</h2>
          <p>When you use Ratio x, we collect the following information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong className="text-foreground">Account Information:</strong> Email address used for authentication</li>
            <li><strong className="text-foreground">Portfolio Data:</strong> Holdings, asset classes, quantities, purchase prices, and purchase dates that you manually enter</li>
            <li><strong className="text-foreground">Usage Data:</strong> Feature interactions and page views for improving the Platform</li>
          </ul>
          <p className="mt-3">
            We do <strong className="text-foreground">not</strong> collect or store any broker credentials, 
            trading passwords, demat account details, or bank account information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">2. How We Use Your Data</h2>
          <p>Your data is used solely for:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Displaying your portfolio tracking dashboard</li>
            <li>Calculating drift analysis and health scores</li>
            <li>Generating educational scenario analyses</li>
            <li>Improving the Platform's features and performance</li>
          </ul>
          <p className="mt-3">
            We do <strong className="text-foreground">not</strong> use your portfolio data for any trading, advisory, 
            or recommendation purposes. Your data is never used to generate buy/sell signals 
            or shared with any third-party for such purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">3. Data Storage & Security</h2>
          <p>
            Your data is stored securely using Supabase, which provides enterprise-grade security including 
            encryption at rest and in transit, row-level security policies, and secure authentication via 
            industry-standard protocols. All data is stored on servers with SOC 2 Type II compliance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">4. Data Sharing</h2>
          <p>
            We do <strong className="text-foreground">not</strong> sell, rent, or share your personal data or 
            portfolio information with any third party, except:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>When required by law or legal process</li>
            <li>With service providers who assist in operating the Platform (e.g., hosting), under strict confidentiality agreements</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">5. Third-Party Data Sources</h2>
          <p>
            The Platform fetches market prices from third-party APIs (AMFI for mutual fund NAVs, Yahoo Finance for equity prices). 
            These requests are made server-side or via public APIs and do not transmit your personal information 
            to these providers. Only ticker symbols are sent to fetch current prices.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong className="text-foreground">Access</strong> your data at any time through the Platform</li>
            <li><strong className="text-foreground">Delete</strong> your holdings, portfolio data, or entire account</li>
            <li><strong className="text-foreground">Export</strong> your data using the Platform's export features</li>
            <li><strong className="text-foreground">Withdraw consent</strong> by discontinuing use and requesting account deletion</li>
          </ul>
          <p className="mt-3">
            To request account deletion, contact us via the information provided on the Platform. 
            We will delete all associated data within 30 days of the request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">7. Cookies</h2>
          <p>
            We use essential cookies only for authentication and session management. 
            We do not use advertising cookies or third-party tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant changes 
            via the Platform. Continued use of the Platform after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">9. Contact</h2>
          <p>
            For privacy-related questions or data deletion requests, please contact us via the information 
            provided on the Platform.
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-surface-border">
        <Link
          to="/"
          className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  </div>
);

export default PrivacyPolicy;
