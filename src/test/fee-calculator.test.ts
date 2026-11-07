import { describe, it, expect } from "vitest";
import {
  getCategoryAvgTer,
  computeCorpus,
  computeLumpSumCorpus,
  getTerVerdict,
  estimateDirectTer,
  computeHiddenCharges
} from "../lib/fee-calculator";

describe("fee-calculator", () => {
  describe("getCategoryAvgTer", () => {
    it("returns correct TER for known categories", () => {
      expect(getCategoryAvgTer("Large Cap Equity")).toBe(1.42);
      expect(getCategoryAvgTer("Mid Cap")).toBe(1.68);
      expect(getCategoryAvgTer("Debt")).toBe(0.52);
    });

    it("returns default TER for unknown categories", () => {
      expect(getCategoryAvgTer("Unknown Random Fund")).toBe(1.50);
    });
  });

  describe("computeCorpus", () => {
    it("calculates future value of SIP correctly", () => {
      // 10,000 per month for 10 years at 12% = ~23.23 lakhs
      const corpus = computeCorpus(10000, 0.12, 10);
      expect(corpus).toBeGreaterThan(2300000);
      expect(corpus).toBeLessThan(2350000);
    });

    it("returns zero return corpus if return is 0", () => {
      expect(computeCorpus(10000, 0, 10)).toBe(1200000);
    });
  });

  describe("computeLumpSumCorpus", () => {
    it("calculates future value of lump sum correctly", () => {
      // 1 Lakh for 10 years at 12%
      const corpus = computeLumpSumCorpus(100000, 0.12, 10);
      expect(corpus).toBeGreaterThan(330000);
      expect(corpus).toBeLessThan(335000);
    });
  });

  describe("getTerVerdict", () => {
    it("identifies efficient, average, and expensive TERs", () => {
      expect(getTerVerdict(1.0, 1.5).label).toBe("Efficient"); // < 85%
      expect(getTerVerdict(1.4, 1.5).label).toBe("Average"); // 85% - 115%
      expect(getTerVerdict(2.0, 1.5).label).toBe("Expensive"); // > 115%
    });
  });

  describe("estimateDirectTer", () => {
    it("estimates direct TER by subtracting 0.9", () => {
      expect(estimateDirectTer(1.5)).toBe(0.6);
    });

    it("floors the direct TER at 0.1", () => {
      expect(estimateDirectTer(0.5)).toBe(0.1);
    });
  });

  describe("computeHiddenCharges", () => {
    it("calculates all hidden charges correctly for a regular equity SIP", () => {
      const result = computeHiddenCharges({
        currentValue: 1000000, // 10L
        totalInvested: 500000, // 5L
        ter: 1.5,
        isEquity: true,
        isRegularPlan: true,
        monthlySIP: 15000
      });

      expect(result.expenseRatioCost).toBe(15000); // 1.5% of 10L
      expect(result.gstOnTer).toBe(2700); // 18% of 15k
      expect(result.stampDuty).toBe(25); // 0.005% of 5L
      expect(result.sttOnRedemption).toBe(10); // 0.001% of 10L
      expect(result.transactionCharges).toBe(1800); // 150 * 12 (since SIP > 10k)
      expect(result.totalRealCost).toBe(15000 + 2700 + 25 + 10 + 1800);
    });
  });
});
