-- Seed data for top Mutual Funds to demonstrate Option B

INSERT INTO mutual_funds (scheme_code, name, amc_name, category, regular_ter, direct_ter) VALUES
('122639', 'Parag Parikh Flexi Cap Fund', 'PPFAS Mutual Fund', 'Equity - Flexi Cap', 1.48, 0.65),
('118989', 'HDFC Mid-Cap Opportunities Fund', 'HDFC Mutual Fund', 'Equity - Mid Cap', 1.62, 0.81),
('120716', 'SBI Bluechip Fund', 'SBI Mutual Fund', 'Equity - Large Cap', 1.55, 0.85),
('125354', 'Nippon India Small Cap Fund', 'Nippon India Mutual Fund', 'Equity - Small Cap', 1.62, 0.68),
('112284', 'Axis Bluechip Fund', 'Axis Mutual Fund', 'Equity - Large Cap', 1.48, 0.62),
('120186', 'ICICI Prudential Equity & Debt Fund', 'ICICI Prudential Mutual Fund', 'Hybrid - Aggressive', 1.74, 1.05),
('118778', 'Mirae Asset Large Cap Fund', 'Mirae Asset Mutual Fund', 'Equity - Large Cap', 1.46, 0.54),
('120505', 'Kotak Flexicap Fund', 'Kotak Mutual Fund', 'Equity - Flexi Cap', 1.65, 0.69),
('118425', 'UTI Nifty 50 Index Fund', 'UTI Mutual Fund', 'Equity - Large Cap', 0.31, 0.20),
('119062', 'Quant Active Fund', 'Quant Mutual Fund', 'Equity - Multi Cap', 1.70, 0.60),
('109400', 'SBI Small Cap Fund', 'SBI Mutual Fund', 'Equity - Small Cap', 1.65, 0.70),
('147703', 'Motilal Oswal Midcap Fund', 'Motilal Oswal Mutual Fund', 'Equity - Mid Cap', 1.72, 0.65),
('113177', 'Franklin India Prima Fund', 'Franklin Templeton Mutual Fund', 'Equity - Mid Cap', 1.83, 0.95),
('103223', 'Tata Large & Mid Cap Fund', 'Tata Mutual Fund', 'Equity - Large & Mid Cap', 1.78, 0.82),
('146528', 'Canara Robeco Bluechip Equity Fund', 'Canara Robeco Mutual Fund', 'Equity - Large Cap', 1.67, 0.45)
ON CONFLICT DO NOTHING;
