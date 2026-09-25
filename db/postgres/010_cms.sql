CREATE TABLE IF NOT EXISTS cms_services (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  description TEXT,
  company TEXT,
  quote TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS cms_projects (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  description TEXT,
  company TEXT,
  quote TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS cms_testimonials (
  id TEXT PRIMARY KEY,
  name TEXT,
  company TEXT,
  quote TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS cms_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE cms_services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE cms_projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS cms_services_slug_idx ON cms_services (slug);
CREATE INDEX IF NOT EXISTS cms_projects_slug_idx ON cms_projects (slug);
CREATE INDEX IF NOT EXISTS cms_services_updated_idx ON cms_services (updated_at DESC);
CREATE INDEX IF NOT EXISTS cms_projects_updated_idx ON cms_projects (updated_at DESC);
CREATE INDEX IF NOT EXISTS cms_testimonials_updated_idx ON cms_testimonials (updated_at DESC);


-- Curated initial testimonials for a fresh AMS database.
-- Existing records are preserved.
INSERT INTO cms_testimonials (id, name, company, quote, data)
VALUES
('t_01','Marcus Thorne','Lumina Real Estate','Kapitech built our real estate portal from scratch using Next.js. The page load speed is blazing fast and our inbound lead conversions increased by 45% within the first month.','{"id":"t_01","quote":"Kapitech built our real estate portal from scratch using Next.js. The page load speed is blazing fast and our inbound lead conversions increased by 45% within the first month.","quoteId":"Kapitech membangun portal real estate kami dari nol menggunakan Next.js. Kecepatan loading halamannya luar biasa cepat dan konversi prospek kami meningkat 45% dalam bulan pertama.","author":"Marcus Thorne","role":"Managing Director","company":"Lumina Real Estate","location":"Jakarta, Indonesia","rating":5,"isPublished":true}'::jsonb),
('t_02','Sarah Chen','Aura Creative Studio','Their design team has an exceptional eye for modern typography and layout. They delivered a cohesive brand identity and a stunning web experience that elevated our firm completely.','{"id":"t_02","quote":"Their design team has an exceptional eye for modern typography and layout. They delivered a cohesive brand identity and a stunning web experience that elevated our firm completely.","quoteId":"Tim desain mereka memiliki keahlian luar biasa dalam tipografi dan tata letak modern. Mereka menghadirkan identitas brand yang sangat kohesif dan pengalaman web yang memukau.","author":"Sarah Chen","role":"Creative Director","company":"Aura Creative Studio","location":"Singapore","rating":5,"isPublished":true}'::jsonb),
('t_03','David Miller','Nexus Fintech','Working with Kapitech on our mobile banking interface was seamless. They simplified complex account journeys and delivered pixel-perfect Figma specs ready for our dev squad.','{"id":"t_03","quote":"Working with Kapitech on our mobile banking interface was seamless. They simplified complex account journeys and delivered pixel-perfect Figma specs ready for our dev squad.","quoteId":"Bekerja dengan Kapitech untuk antarmuka mobile banking sangat lancar. Mereka menyederhanakan alur pengguna yang kompleks dan menyerahkan spesifikasi Figma yang presisi untuk tim developer kami.","author":"David Miller","role":"Head of Product","company":"Nexus Fintech","location":"Hong Kong","rating":5,"isPublished":true}'::jsonb),
('t_04','Elena Rodriguez','Solaris CleanTech','The solar energy monitoring dashboard Kapitech engineered gave our operations team instant visibility across 40+ solar farms with zero lag. Highly dependable engineering.','{"id":"t_04","quote":"The solar energy monitoring dashboard Kapitech engineered gave our operations team instant visibility across 40+ solar farms with zero lag. Highly dependable engineering.","quoteId":"Dashboard monitoring energi surya yang dikembangkan Kapitech memberi tim operasi kami visibilitas langsung di lebih dari 40 ladang surya tanpa lag. Rekayasa yang sangat andal.","author":"Elena Rodriguez","role":"Operations VP","company":"Solaris CleanTech","location":"Melbourne, Australia","rating":5,"isPublished":true}'::jsonb),
('t_05','Julian Vane','Vivid Commerce','Our headless Shopify migration handled our flash sale traffic peaks without a hitch. Checkout conversion increased by 38%. Kapitech delivers genuine business results.','{"id":"t_05","quote":"Our headless Shopify migration handled our flash sale traffic peaks without a hitch. Checkout conversion increased by 38%. Kapitech delivers genuine business results.","quoteId":"Migrasi Shopify headless kami menangani lonjakan traffic flash sale tanpa hambatan. Konversi checkout meningkat 38%. Kapitech memberikan hasil bisnis nyata.","author":"Julian Vane","role":"Founder & CEO","company":"Vivid Commerce","location":"Jakarta, Indonesia","rating":5,"isPublished":true}'::jsonb),
('t_06','Michael Kross','Kross Cloud Systems','Clear milestones, proactive communication, and zero technical fluff. Kapitech is our go-to partner whenever we need to launch a new digital product on a tight timeline.','{"id":"t_06","quote":"Clear milestones, proactive communication, and zero technical fluff. Kapitech is our go-to partner whenever we need to launch a new digital product on a tight timeline.","quoteId":"Milestone yang jelas, komunikasi proaktif, dan tanpa basa-basi teknis. Kapitech adalah mitra andalan kami setiap kali kami perlu meluncurkan produk digital dalam jadwal ketat.","author":"Michael Kross","role":"Chief Technology Officer","company":"Kross Cloud Systems","location":"Kuala Lumpur, Malaysia","rating":5,"isPublished":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
