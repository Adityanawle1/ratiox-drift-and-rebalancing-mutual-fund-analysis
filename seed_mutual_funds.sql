-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mutual_funds (
    scheme_code BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    regular_ter NUMERIC(4, 2),
    direct_ter NUMERIC(4, 2)
);

-- Truncate to avoid duplicates if re-running
TRUNCATE TABLE public.mutual_funds;

-- Insert top 10 popular Indian Mutual Funds with their Regular and Direct TERs
-- (TERs are approximations based on recent AMFI data for demonstration)
INSERT INTO public.mutual_funds (scheme_code, name, regular_ter, direct_ter) VALUES
(122639, 'Parag Parikh Flexi Cap Fund - Direct Plan', 1.39, 0.55),
(122640, 'Parag Parikh Flexi Cap Fund - Regular Plan', 1.39, 0.55),
(119062, 'SBI Small Cap Fund - Direct Plan', 1.62, 0.69),
(119063, 'SBI Small Cap Fund - Regular Plan', 1.62, 0.69),
(118989, 'HDFC Mid-Cap Opportunities Fund - Direct Plan', 1.48, 0.77),
(118990, 'HDFC Mid-Cap Opportunities Fund - Regular Plan', 1.48, 0.77),
(125354, 'Nippon India Small Cap Fund - Direct Plan', 1.47, 0.65),
(125355, 'Nippon India Small Cap Fund - Regular Plan', 1.47, 0.65),
(120503, 'Quant Active Fund - Direct Plan', 1.70, 0.58),
(120504, 'Quant Active Fund - Regular Plan', 1.70, 0.58),
(118272, 'ICICI Prudential Bluechip Fund - Direct Plan', 1.54, 0.88),
(118273, 'ICICI Prudential Bluechip Fund - Regular Plan', 1.54, 0.88),
(120716, 'Kotak Emerging Equity Fund - Direct Plan', 1.53, 0.38),
(120717, 'Kotak Emerging Equity Fund - Regular Plan', 1.53, 0.38),
(119598, 'Axis Bluechip Fund - Direct Plan', 1.48, 0.61),
(119599, 'Axis Bluechip Fund - Regular Plan', 1.48, 0.61),
(118778, 'Mirae Asset Large Cap Fund - Direct Plan', 1.48, 0.53),
(118779, 'Mirae Asset Large Cap Fund - Regular Plan', 1.48, 0.53),
(120823, 'DSP Midcap Fund - Direct Plan', 1.69, 0.73),
(120824, 'DSP Midcap Fund - Regular Plan', 1.69, 0.73);
