/**
 * Represents fetched market price data from an external source.
 * Supports Yahoo Finance (equities) and AMFI (mutual funds).
 */
export type PriceData = {
  symbol: string;
  price: number;
  lastUpdated: Date;
  source: 'amfi' | 'yahoo' | 'manual';
};

export type SearchResult = {
  symbol: string;   // NSE ticker without .NS
  name: string;
  exchange: string;
  type: string;
  price?: number;
  regular_ter?: number; // Added to hold MF TER
  direct_ter?: number;  // Added to hold MF TER
};

// ──────────────────────────────────────────────────────────
// Price Cache — 5 minute TTL (was 60s, increased to reduce
// API calls at scale; prices don't move that fast)
// ──────────────────────────────────────────────────────────
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedPrice(symbol: string): number | null {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }
  return null;
}

function setCachedPrice(symbol: string, price: number): void {
  priceCache.set(symbol, { price, timestamp: Date.now() });
}

export function clearPriceCache(): void {
  priceCache.clear();
}

// ──────────────────────────────────────────────────────────
// Search Cache — 2 minute TTL for search results
// ──────────────────────────────────────────────────────────
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const SEARCH_CACHE_TTL = 2 * 60 * 1000;

function getCachedSearch(query: string): SearchResult[] | null {
  const cached = searchCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
    return cached.results;
  }
  return null;
}

function setCachedSearch(query: string, results: SearchResult[]): void {
  searchCache.set(query.toLowerCase(), { results, timestamp: Date.now() });
}

// ──────────────────────────────────────────────────────────
// Yahoo Finance URL — production-safe approach
// In dev: Vite proxy handles CORS
// In prod: Use multiple CORS proxy fallbacks with retry
// ──────────────────────────────────────────────────────────
const YAHOO_BASE_URL = '/api/yahoo';

async function fetchFromYahooProxy(url: string): Promise<Response> {
  const pathAndSearch = url.replace('https://query1.finance.yahoo.com', '');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
  
  try {
    const res = await fetch(`${YAHOO_BASE_URL}${pathAndSearch}`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ──────────────────────────────────────────────────────────
// AMFI MF NAV — free, no auth, no CORS issues
// ──────────────────────────────────────────────────────────
export async function fetchMFNav(schemeCode: string): Promise<PriceData | null> {
  const cachedPrice = getCachedPrice(`mf_${schemeCode}`);
  if (cachedPrice !== null) {
    return { symbol: schemeCode, price: cachedPrice, lastUpdated: new Date(), source: 'amfi' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    const data = await res.json();
    const nav = parseFloat(data.data?.[0]?.nav);
    if (isNaN(nav)) return null;
    
    setCachedPrice(`mf_${schemeCode}`, nav);
    return { symbol: schemeCode, price: nav, lastUpdated: new Date(), source: 'amfi' };
  } catch { return null; }
}

import { supabase } from './supabase';

interface MFSearchResult {
  schemeCode: number;
  schemeName: string;
}

export async function searchMutualFunds(query: string): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('mutual_funds')
      .select('scheme_code, name, regular_ter, direct_ter')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (error || !data) {
      // Fallback to external API if our local DB search fails
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return [];
      const extData = (await res.json()) as MFSearchResult[];
      return extData.slice(0, 5).map((f) => ({
        symbol: String(f.schemeCode),
        name: f.schemeName || "",
        exchange: 'AMFI',
        type: 'mf',
      }));
    }

    return data.map((f) => ({
      symbol: String(f.scheme_code),
      name: f.name || "",
      exchange: 'Ratio X',
      type: 'mf',
      regular_ter: f.regular_ter ?? undefined,
      direct_ter: f.direct_ter ?? undefined,
    }));
  } catch { return []; }
}

// ──────────────────────────────────────────────────────────
// Yahoo Finance for equities/ETFs — with CORS proxy rotation
// ──────────────────────────────────────────────────────────
export async function fetchYahooPrice(symbol: string): Promise<PriceData | null> {
  const cachedPrice = getCachedPrice(`yahoo_${symbol}`);
  if (cachedPrice !== null) {
    return { symbol, price: cachedPrice, lastUpdated: new Date(), source: 'yahoo' };
  }

  try {
    const ticker = `${symbol}.NS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    
    const res = await fetchFromYahooProxy(url);
    if (!res.ok) return null;
    
    const json = await res.json();
    const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!price || isNaN(price)) return null;
    
    setCachedPrice(`yahoo_${symbol}`, price);
    return { symbol, price, lastUpdated: new Date(), source: 'yahoo' };
  } catch { return null; }
}

interface YahooQuote {
  symbol: string;
  longname?: string;
  shortname?: string;
  exchange: string;
  quoteType?: string;
}

// ──────────────────────────────────────────────────────────
// Search Universal Instruments (Yahoo Finance + AMFI)
// ──────────────────────────────────────────────────────────
export async function searchAllInstruments(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  
  // Check search cache
  const cachedResults = getCachedSearch(query);
  if (cachedResults) return cachedResults;
  
  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=IN&quotesCount=8&newsCount=0&enableFuzzyQuery=true`;
    
    // Run both searches in parallel
    const [yahooRes, mfResults] = await Promise.all([
      fetchFromYahooProxy(searchUrl).catch(() => null),
      searchMutualFunds(query).catch(() => [])
    ]);

    let yahooQuotes: SearchResult[] = [];
    if (yahooRes && yahooRes.ok) {
      const json = await yahooRes.json();
      const quotes: YahooQuote[] = json?.quotes || [];
      
      const filteredQuotes = quotes
        .filter((q) =>
          q.exchange === 'NSI' ||
          q.exchange === 'NSE' ||
          (q.symbol && q.symbol.endsWith('.NS')) ||
          q.exchange === 'BSE' ||
          (q.symbol && q.symbol.endsWith('.BO'))
        )
        .slice(0, 5)
        .map((q) => ({
          symbol: (q.symbol || '').replace('.NS', '').replace('.BO', ''),
          name: q.longname || q.shortname || q.symbol || '',
          exchange: q.exchange === 'BSE' || (q.symbol && q.symbol.endsWith('.BO')) ? 'BSE' : 'NSE',
          type: (q.quoteType || 'equity').toLowerCase() === 'etf' ? 'etf' : 
                (q.quoteType || 'equity').toLowerCase() === 'mutualfund' ? 'mf' : 'equity',
        }));
      
      yahooQuotes = filteredQuotes;
    }

    // Combine both results
    const results = [...yahooQuotes, ...mfResults];
    
    // Cache combined results
    if (results.length > 0) {
      setCachedSearch(query, results);
    }
    
    return results;
  } catch { return []; }
}

// ──────────────────────────────────────────────────────────
// Batch refresh — throttled with concurrency limit
// ──────────────────────────────────────────────────────────
const MAX_CONCURRENT_REQUESTS = 5; // Prevent hammering APIs

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then(result => {
      results.push(result);
      executing.splice(executing.indexOf(p), 1);
    });
    executing.push(p);

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

export async function refreshPrices(
  holdings: { symbol: string; instrument_type: string; avg_buy_price: number }[]
): Promise<{ prices: Record<string, number>; failedSymbols: string[] }> {
  const prices: Record<string, number> = {};
  const failedSymbols: string[] = [];

  const tasks = holdings.map((h) => async () => {
    try {
      let priceData: PriceData | null = null;
      
      if (['mf', 'mutual_fund'].includes(h.instrument_type)) {
        priceData = await fetchMFNav(h.symbol);
      } else {
        priceData = await fetchYahooPrice(h.symbol);
      }
      
      if (priceData) {
        prices[h.symbol] = priceData.price;
      } else {
        prices[h.symbol] = h.avg_buy_price;
        failedSymbols.push(h.symbol);
      }
    } catch {
      prices[h.symbol] = h.avg_buy_price;
      failedSymbols.push(h.symbol);
    }
  });

  await runWithConcurrency(tasks, MAX_CONCURRENT_REQUESTS);

  return { prices, failedSymbols };
}
