import { describe, it, expect } from "vitest";
import {
  enrichHoldingsWithMarketData,
  calculateDrift,
  calculateHealthScore,
  analyzeRebalance,
  AssetClass
} from "../lib/drift-engine";

describe("drift-engine", () => {
  const mockHoldings = [
    {
      id: "1",
      portfolio_id: "p1",
      user_id: "u1",
      symbol: "RELIANCE",
      name: "Reliance",
      asset_class: "Large Cap Equity",
      instrument_type: "EQ",
      quantity: 100,
      avg_buy_price: 2500,
      current_price: 2500,
      last_price_updated: null,
      purchase_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // > 365 days
      ter: null,
      plan_type: null,
      monthly_sip: null,
      created_at: "",
      updated_at: ""
    },
    {
      id: "2",
      portfolio_id: "p1",
      user_id: "u1",
      symbol: "TCS",
      name: "TCS",
      asset_class: "Large Cap Equity",
      instrument_type: "EQ",
      quantity: 50,
      avg_buy_price: 3000,
      current_price: null,
      last_price_updated: null,
      purchase_date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // < 365 days
      ter: null,
      plan_type: null,
      monthly_sip: null,
      created_at: "",
      updated_at: ""
    }
  ];

  describe("enrichHoldingsWithMarketData", () => {
    it("enriches holdings correctly with live prices and computes financials", () => {
      const livePrices = { RELIANCE: 3000, TCS: 4000 };
      const enriched = enrichHoldingsWithMarketData(mockHoldings, livePrices);

      expect(enriched.length).toBe(2);
      expect(enriched[0].currentPrice).toBe(3000);
      expect(enriched[0].marketValue).toBe(300000); // 100 * 3000
      expect(enriched[0].costBasis).toBe(250000); // 100 * 2500
      expect(enriched[0].pnl).toBe(50000);
      expect(enriched[0].pnlPercent).toBe(20);
      expect(enriched[0].taxStatus).toBe("LTCG");

      expect(enriched[1].currentPrice).toBe(4000);
      expect(enriched[1].marketValue).toBe(200000); // 50 * 4000
      expect(enriched[1].taxStatus).toBe("STCG");
    });

    it("falls back to avg_buy_price if current price and live price are missing", () => {
      const enriched = enrichHoldingsWithMarketData(mockHoldings, {});
      expect(enriched[0].currentPrice).toBe(2500); // from mock
      expect(enriched[1].currentPrice).toBe(3000); // avg_buy_price fallback
    });
  });

  describe("calculateDrift & calculateHealthScore", () => {
    const targets: AssetClass[] = [
      { name: "Large Cap Equity", targetPct: 50, driftThreshold: 5 },
      { name: "Debt", targetPct: 50, driftThreshold: 5 }
    ];

    it("calculates drift and health score accurately", () => {
      const livePrices = { RELIANCE: 2500, TCS: 3000 };
      const enriched = enrichHoldingsWithMarketData(mockHoldings, livePrices);
      // Total portfolio value = 250,000 + 150,000 = 400,000 (all Large Cap)

      const driftResults = calculateDrift(enriched, targets);
      expect(driftResults.length).toBe(2);

      const largeCapDrift = driftResults.find(d => d.assetClass === "Large Cap Equity")!;
      expect(largeCapDrift.currentPct).toBe(100);
      expect(largeCapDrift.drift).toBe(50); // Target 50, Current 100
      expect(largeCapDrift.status).toBe("critical");

      const debtDrift = driftResults.find(d => d.assetClass === "Debt")!;
      expect(debtDrift.currentPct).toBe(0);
      expect(debtDrift.drift).toBe(-50); // Target 50, Current 0

      const healthScore = calculateHealthScore(driftResults);
      // Avg deviation = (50 + 50) / 2 = 50. Health score = 100 - (50 * 2) = 0
      expect(healthScore).toBe(0);
    });
  });

  describe("analyzeRebalance", () => {
    const targets: AssetClass[] = [
      { name: "Large Cap Equity", targetPct: 50, driftThreshold: 5 },
      { name: "Debt", targetPct: 50, driftThreshold: 5 }
    ];

    it("generates correct trades without inflow", () => {
      const livePrices = { RELIANCE: 2500, TCS: 3000 };
      const enriched = enrichHoldingsWithMarketData(mockHoldings, livePrices);
      
      const result = analyzeRebalance(enriched, targets, 0);
      expect(result.trades.length).toBe(2);
      
      // Total value = 400,000. Target for each = 200,000
      // Current Large Cap = 400,000. Current Debt = 0
      
      const sellTrade = result.trades.find(t => t.action === "sell")!;
      expect(sellTrade.assetClass).toBe("Large Cap Equity");
      expect(sellTrade.amountINR).toBe(200000);

      const buyTrade = result.trades.find(t => t.action === "buy")!;
      expect(buyTrade.assetClass).toBe("Debt");
      expect(buyTrade.amountINR).toBe(200000);

      // Score should improve
      expect(result.healthScoreBefore).toBe(0);
      expect(result.healthScoreAfter).toBe(100);
    });

    it("generates correct trades with inflow", () => {
      const livePrices = { RELIANCE: 2500, TCS: 3000 };
      const enriched = enrichHoldingsWithMarketData(mockHoldings, livePrices);
      
      // Add 400,000 inflow. Total target value = 800,000.
      // Target per class = 400,000.
      // Large Cap current = 400,000. Debt current = 0.
      const result = analyzeRebalance(enriched, targets, 400000);
      
      // Only 1 buy trade needed! Large cap is perfectly balanced automatically.
      expect(result.trades.length).toBe(1);
      
      const buyTrade = result.trades[0];
      expect(buyTrade.action).toBe("buy");
      expect(buyTrade.assetClass).toBe("Debt");
      expect(buyTrade.amountINR).toBe(400000);

      expect(result.healthScoreAfter).toBe(100);
    });
  });
});
