import fs from 'fs';
const query = "Reliance";
fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=IN&quotesCount=8&newsCount=0&enableFuzzyQuery=true`, { headers: { 'Accept': 'application/json' } })
  .then(res => res.json())
  .then(json => {
    const quotes = json?.quotes || [];
    const filteredQuotes = quotes.filter((q) =>
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
    fs.writeFileSync('result.json', JSON.stringify({ quotes, filteredQuotes }, null, 2), 'utf8');
  })
  .catch(console.error);
