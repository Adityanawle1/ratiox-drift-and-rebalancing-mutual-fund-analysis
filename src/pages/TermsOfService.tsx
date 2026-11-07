import { Link } from "react-router-dom";
import Nav from "@/components/Nav";

const TermsOfService = () => (
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
        Terms of Service
      </h1>
      <p className="text-xs font-mono text-muted-foreground mb-12">Last updated: April 2026</p>

      <div className="space-y-10 text-sm font-body text-muted-foreground leading-relaxed">

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">1. Nature of Service</h2>
          <p>
            Ratio x ("the Platform") is an <strong className="text-foreground">educational portfolio tracking and analysis tool</strong>. 
            The Platform allows users to manually input their investment holdings, track asset allocation drift, 
            and view hypothetical rebalancing scenarios for educational purposes.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Ratio x is NOT a SEBI-registered Investment Adviser (IA), Research Analyst (RA), 
            Portfolio Manager (PMS), or Stock Broker.</strong> The Platform does not hold any license or registration 
            under the Securities and Exchange Board of India (SEBI) or any other financial regulatory authority.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">2. No Investment Advice</h2>
          <p>
            Nothing on this Platform constitutes investment advice, financial advice, trading advice, tax advice, 
            or any other form of professional advice. All information, data, calculations, analyses, scenarios, 
            and educational content provided through the Platform are for <strong className="text-foreground">informational and educational purposes only</strong>.
          </p>
          <p className="mt-3">
            The Platform does not recommend, suggest, or endorse the purchase, sale, or holding of any security, 
            financial product, or investment instrument. Any references to specific securities, asset classes, 
            or financial instruments are purely for portfolio tracking purposes entered by the user.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">3. No Execution Capability</h2>
          <p>
            Ratio x does not execute, facilitate, or process any buy or sell transactions. The Platform has no 
            integration with any stock broker, trading platform, or financial intermediary for the purpose of 
            executing trades. Any analysis or scenario displayed by the Platform requires the user to independently 
            evaluate and execute through their own broker, if they choose to do so entirely at their own discretion and risk.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">4. User Responsibility</h2>
          <p>
            Users are solely responsible for verifying all data, calculations, and information presented on the Platform. 
            Users must consult qualified SEBI-registered investment advisors, licensed financial planners, or qualified 
            Chartered Accountants before making any investment, tax, or financial decisions.
          </p>
          <p className="mt-3">
            By using this Platform, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>You will not rely on the Platform for investment decisions</li>
            <li>All financial decisions are made at your own risk and discretion</li>
            <li>The Platform's calculations may contain errors or use assumptions that do not apply to your situation</li>
            <li>Tax laws and regulations change frequently and the Platform may not reflect current laws</li>
            <li>Past performance of any investment does not guarantee future results</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">5. Data Accuracy</h2>
          <p>
            Market data, prices, and NAV values displayed on the Platform are fetched from third-party sources 
            and may be delayed, inaccurate, or incomplete. Ratio x makes no warranty regarding the accuracy, 
            completeness, or timeliness of any data displayed. Users should independently verify all portfolio 
            values and calculations with their broker or depository statements.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Ratio x, its creators, affiliates, and contributors shall 
            not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, 
            including but not limited to financial losses, arising from the use of or inability to use the Platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">7. Intellectual Property</h2>
          <p>
            All content, design, code, and branding on the Platform are the intellectual property of Ratio x. 
            Users may not reproduce, distribute, or create derivative works without written permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">8. Modifications</h2>
          <p>
            Ratio x reserves the right to modify these Terms at any time. Continued use of the Platform after 
            changes constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. 
            Any disputes arising from the use of this Platform shall be subject to the exclusive jurisdiction 
            of the courts in India.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">10. Contact</h2>
          <p>
            For questions about these Terms, please contact us via the information provided on the Platform.
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

export default TermsOfService;
