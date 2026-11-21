# Project Specification: `batch.care` — Osteoporosis & Bone-Health Diet PWA

## 1. Objective & Product Vision
Build a mobile-first **Progressive Web App (PWA)** designed specifically for managing daily nutrition, bone-health micronutrients, hydration, sunlight exposure, and body weight for a **50-year-old Indian female (53 kg, 156 cm, BMI 21.8)** diagnosed with **osteoporosis** (post-zoledronic acid infusion, serum calcium `8.0 mg/dL`, serum 25(OH) Vitamin D `18 ng/mL`).

### Anti-AI / Craftsmanship Mandate (CRITICAL)
The UI must look like a **bespoke, human-crafted consumer wellness product** (inspired by modern boutique health apps like *Batch* on Dribbble), **NOT** a generic AI-generated admin template:
- **Zero generic purple/blue gradients**, zero harsh `#000000` drop shadows, and zero cluttered unstyled HTML tables.
- **Tactile & Organic Palette:** Warm cream canvas (`#F8F8F6`), crisp white cards (`#FFFFFF`) with ultra-subtle hairline borders (`1px solid rgba(24, 26, 31, 0.05)`), deep charcoal ink (`#181A1F`), botanical sage primary (`#2E6F5E`), and fresh lime pulse accents (`#8CE07A`) for progress rings and active states.
- **Typography:** `Plus Jakarta Sans` (weights 400, 500, 600, 700, 800) with tabular numerals (`font-variant-numeric: tabular-nums`) on all nutrient figures so numbers align cleanly without jitter.
- **Mobile Ergonomics:** Sticky glassmorphic top header on desktop + fixed bottom floating dock navigation on mobile phones (`max-width: 100vw`, minimum `44px × 44px` touch targets, `env(safe-area-inset-bottom)` support).

---

## 2. Progressive Web App (PWA) Requirements
The app must be 100% installable on iOS (Safari "Add to Home Screen") and Android (Chrome Install Prompt) and work offline:
1. **`manifest.json`:**
   - `name`: `"Batch Care — Bone-Health & Diet Planner"`
   - `short_name`: `"batch.care"`
   - `start_url`: `"./index.html"`
   - `display`: `"standalone"`
   - `background_color`: `"#F8F8F6"`
   - `theme_color`: `"#2E6F5E"`
   - `icons`: Include inline SVG data-URI or generated `192x192` and `512x512` PNG app icons featuring the sage rounded-square sun/leaf emblem.
2. **Service Worker (`sw.js`):**
   - Cache-first strategy for static assets (HTML, CSS, JS, Google Fonts) so the user can log water, check meals, and view diet plans completely offline.
   - Versioned cache key (`batch-care-v1`) with automatic cleanup of old caches on `activate`.
3. **iOS & Android Meta Tags:**
   - Include `apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="default"`, `apple-mobile-web-app-title="batch.care"`, and a `<meta name="theme-color" content="#F8F8F6">`.
4. **Offline Persistence & Backup:**
   - Store all state in `localStorage` under a single namespaced JSON object (`batch_care_state_v1`).
   - Provide **Export JSON Backup** and **Import JSON Backup** buttons so data is never lost when clearing browser cache.

---

## 3. Design System & Component Tokens

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#F8F8F6` | Main app background (Warm Cream) |
| `--bg-surface` | `#FFFFFF` | Cards, bottom sheets, modals |
| `--bg-muted` | `#EFECE6` | Input pills, segmented toggles, inactive badges |
| `--ink-primary` | `#181A1F` | Primary headings & numeric values |
| `--ink-secondary` | `#646873` | Subtitles, units (`mg`, `kcal`), helper text |
| `--brand-sage` | `#2E6F5E` | Primary buttons, active tab pills, hero card |
| `--brand-sage-soft` | `#E7F2EF` | Tinted icon badges, subtle highlights |
| `--accent-lime` | `#8CE07A` | Goal-met progress bars, positive status badges |
| `--status-warn` | `#F59E0B` | Approaching upper limit (e.g., Cholesterol/Sodium) |
| `--status-alert` | `#E11D48` | Clinical alert / low lab value / exceeded upper limit |
| `--radius-card` | `24px` (`rounded-3xl`) | All primary dashboard and meal cards |
| `--radius-pill` | `9999px` (`rounded-full`) | Navigation tabs, quick-add water chips, tags |
| `--shadow-soft` | `0 8px 30px rgba(24,26,31,0.04)` | Elevated card shadow |

---

## 4. Five-Tab Application Architecture

### Tab 1: Overview Dashboard (`#dashboard`)
The command center for daily execution and clinical awareness:
1. **Patient Clinical Snapshot Card:**
   - Displays Age/Sex (`50y Female`), Height (`156 cm`), Current Weight (linked live to Weight Tracker, default `53.0 kg`), auto-calculated BMI (`21.8 — Normal`), and active Iron Mode (`Post-Menopausal: 11 mg` vs `Pre-Menopausal: 29 mg`).
   - **Lab Alert Strip:** Highlights Serum Calcium (`8.0 mg/dL` — Low; ref `8.5–10.5`) and 25(OH) Vitamin D (`18 ng/mL` — Deficient; target `>30 ng/mL`) with a subtle reminder of red-flag symptoms (muscle cramps, tingling around mouth/fingers, palpitations).
2. **Active Diet Plan Hero Card (Botanical Sage `#2E6F5E`):**
   - Shows currently active plan name (e.g., *"Plan A: Ragi Dosa + Soy + Keerai"*), quick summary of planned meals, and 4 key nutrient ring gauges (**Calories**, **Protein**, **Calcium**, **Vitamin D**) with a one-tap button to jump to Tab 4 (`Edit Today's Meals`).
3. **Daily Lifestyle Check-in Widgets (Interactive):**
   - **Water Intake Logger:** Visual hydration progress bar against daily target (default `2,250 ml`), with quick-tap pill buttons (`+150 ml Cup`, `+250 ml Glass`, `+500 ml Bottle`, `-250 ml Undo`).
   - **Sunlight Exposure Logger:** Daily outdoor UV-B tracker against target (default `20 mins` between 10 AM – 2 PM), with quick-tap buttons (`+5m`, `+10m`, `+15m`) and a custom minute input.
   - **Body Weight Tracker:** Quick weight logger (`kg`) with date stamp, automatic BMI recalculation, and a clean SVG sparkline showing recent weight trend.

---

### Tab 2: RDA & Clinical Targets Setup (`#rda`)
Allows manual customization of every daily target while preserving clinical defaults:
1. **Menopausal Status Quick-Switch:**
   - Toggle between **Post-Menopausal** (auto-sets Iron target to `11 mg/day`, Calcium to `1,200 mg/day`) and **Pre-Menopausal** (auto-sets Iron target to `29 mg/day`, Calcium to `1,000 mg/day`).
2. **Editable Target Cards (Grouped cleanly):**
   - **Macros & Limits:** Energy (`1600–1800 kcal`), Protein (`53–64 g`), Dietary Fibre (`25–30 g`), Sodium Upper Limit (`< 2000 mg`), Cholesterol Upper Limit (`< 300 mg`).
   - **Bone-Health Minerals:** Calcium (`1000–1200 mg`, max `< 2000 mg`), Phosphorus (`700–1000 mg`), Magnesium (`350–400 mg`), Iron (`11 mg` or `29 mg`), Zinc (`10–13.2 mg`), Potassium (`3500 mg`).
   - **Vitamins:** Vitamin D (`20–25 mcg` / `800–1000 IU` maintenance + doctor supplement), Vitamin C (`75–100 mg`), Vitamin K (`55–90 mcg`), Vitamin B12 (`2.2 mcg`).
   - **Lifestyle Targets:** Daily Water (`2250 ml`), Daily Sunlight (`20 mins`), Target Weight (`53.0 kg`).
3. **Reference Column:** Shows both **ICMR-NIN 2020 RDA** and **Osteoporosis Clinical Guideline** values side-by-side next to the editable input fields, with a `"Restore Clinical Defaults"` button.

---

### Tab 3: Master Food DB & Portion Prep (`#fooddb`)
A two-part workspace separating **raw nutritional data** from **ready-to-pick meal portions**:
1. **Sub-View A: Master Food Database (Base 100 g or 1 Standard Unit)**
   - Searchable and filterable by category (*Eggs & Dairy, Fruits, Grains & Dosa, Gravies & Dals, Proteins, Vegetables, Night/Custom*).
   - Displays all 18 nutrients per 100 g / base unit (verified against **IFCT 2017** and **USDA FoodData Central**).
   - **Add Custom Food Modal:** Allows adding new foods (e.g., chapati, idli, ragi kanji, buttermilk, fish) by entering per-100g or per-serving nutrients.
2. **Sub-View B: Portion & Menu Prep (Weight & Quantity Configurator)**
   - Select any item from the Master DB, set the exact **Weight (`g` or `ml`)** or **Quantity multiplier**, assign it to a meal slot/category, and save it to the **Ready Menu Pool**.
   - Pre-populated with all user-requested portions (e.g., *1 Whole Egg + 1 Egg White (~85 g)*, *Pomegranate 100 g*, *Banana Yelakki 100 g*, *Ragi Dosa ×2 (50 g flour + 1 tsp oil)*, *Rice Cooked 70 g*, *Soy Chunks Dry 50 g*, *Chicken Breast 100 g*, *Paneer 50 g*, etc.).

---

### Tab 4: Diet Builder & Saved Plans (`#builder`)
Interactive meal composer where the user builds a day's chart from prepped items and saves multiple named plans:
1. **Saved Diet Plan Switcher Bar (Top of Tab):**
   - Horizontal scrollable pills showing all saved templates (e.g., `Plan A: Ragi + Soy + Keerai`, `Plan B: Moong + Chicken + Beans`, `Plan C: Ragi + Paneer + Sambar`, `Plan D: Muesli + Soy + Beetroot`).
   - Actions: **Load Plan**, **Save Changes**, **Save As New Plan** (prompts for name so user can easily create 4–5+ variations), **Duplicate**, and **Delete**.
2. **Structured Category Slots (Morning, Afternoon, Night & Lifestyle):**
   - **Morning — Eggs:** Toggle/select egg option (`1 Whole + 1 White`, `2 Boiled Eggs`, or `None`).
   - **Morning — Daily Fruits (Multi-select):** Checkboxes for daily staples (`Pomegranate 100 g`, `Banana Yelakki 100 g`).
   - **Morning — Rotating Fruit (Pick 1):** Radio pills (`Papaya 100 g`, `Sapota 100 g`, `Guava 100 g`, `Apple 100 g`, `Orange 100 g`, `Pineapple 100 g`).
   - **Morning — Breakfast (Pick 1):** Radio pills (`Ragi Dosa ×2`, `Moong Dosa ×2`, `Muesli 40 g + 150 ml Toned Milk`).
   - **Afternoon — Staple Grain:** Adjustable portion (`Rice 70 g` or `Rice 100 g` or `None`).
   - **Afternoon — Gravy / Dal (~150 ml, Pick 1):** Radio pills (`Sambar`, `Green Leaves Curry / Keerai Masiyal`, `Moong Dal Curry`, `Rasam`, `Vatha/Kara Kuzhambu`, `Mor Kuzhambu`, `Kootu`).
   - **Afternoon — Primary Protein (Pick 1):** Radio pills (`Chicken Breast 100 g`, `Soy Chunks 50 g dry`, `Paneer 50 g`).
   - **Afternoon — Vegetable Poriyal (100 g, Pick 1):** Radio pills (`French Beans`, `Carrot`, `Greens / Keerai Poriyal`, `Beetroot`, `Drumstick Pods`, `Cabbage`, `Ladies Finger`, `Brinjal`, `Pumpkin`, `Cluster Beans`, `Bottle Gourd`).
   - **Afternoon — Accompaniment:** Toggle (`Curd 1 tbsp / 15 g`).
   - **Night Meal & Extra Items:** Multi-select slot allowing any prepped items or custom night dishes (e.g., Ragi Dosa, Chapati, Milk, Curd, Vegetables) to complete daily calorie and calcium goals.
   - **Planned Lifestyle Targets inside Plan:** Planned Water (`ml`) and Sunlight (`mins`) saved with the template.
3. **Sticky Bottom/Side Live Totalizer Strip:**
   - Shows real-time running totals for **kcal**, **Protein**, **Calcium**, **Iron**, **Sodium**, and **Cholesterol** as items are tapped.

---

### Tab 5: Clinical Analysis & Comparison (`#analysis`)
Deep-dive evaluation engine with source-cited clinical rules and doctor-ready export:
1. **Comprehensive 18-Nutrient Goal Progress Grid:**
   - Visual progress bars color-coded by status:
     - **Sage / Lime (`#8CE07A`):** Within optimal target range.
     - **Amber (`#F59E0B`):** Below 80% of minimum target (deficit) or within 10% of upper limit.
     - **Rose (`#E11D48`):** Exceeds safety upper limit (e.g., Sodium `>2000 mg`, Cholesterol `>300 mg`, Calcium `>2000 mg`).
2. **Dynamic Source-Cited Clinical Comments Engine:**
   Automatically evaluates the active diet plan and generates specific clinical notes citing **ICMR-NIN 2020**, **IFCT 2017**, and **Indian Menopause Society / Endocrine Society Bone-Health Guidelines**:
   - *Calcium Split-Dose Rule:* If dietary calcium exceeds `500 mg` in a single meal or total calcium is below `1000 mg`, explains intestinal absorption saturation (`<=500 mg` per dose) and calculates exact supplement gap needed (pending doctor confirmation).
   - *Vitamin D Deficit Alert:* Notes that food provides `< 3 mcg (120 IU)` against her `18 ng/mL` deficiency, confirming prescribed loading/maintenance Vitamin D3 plus midday sunlight (`15–30 mins`) are mandatory.
   - *Iron vs. Calcium Interaction:* Reminds user to space any prescribed iron supplement at least **2 hours apart** from high-calcium foods (ragi, milk, curd, paneer) or calcium tablets, and notes Vitamin C pairings (guava/papaya/drumstick) boost non-heme iron absorption from moong/soy/greens.
   - *Post-Zoledronic Acid Electrolyte Check:* Highlights Magnesium (`target 350–400 mg`) and Phosphorus (`700–1000 mg`) intake alongside serum albumin-corrected calcium monitoring.
   - *Lipid & Sodium Guardrails:* Flags if whole eggs push cholesterol near/above `300 mg` (validating the `1 whole + 1 egg white` swap at `185 mg`) or if gravies/poriyal push sodium near `2000 mg` (increasing urinary calcium loss).
   - *Night Meal Gap Check:* If the night slot is empty and total calories are `< 1400 kcal`, flags muscle-catabolism and fall-risk concerns for a `53 kg` osteoporosis patient.
3. **Multi-Plan Side-by-Side Comparison Matrix:**
   - Compares all saved diet plans (`Plan A`, `Plan B`, `Plan C`, `Plan D`, etc.) across Calories, Protein, Calcium, Iron, Magnesium, Potassium, Sodium, Cholesterol, Fibre, and overall `% Goals Met`.
4. **Doctor-Ready Print / PDF Summary:**
   - Dedicated `"Print / Save PDF for Doctor"` button with clean `@media print` stylesheet that hides navigation chrome and formats the patient profile, active meal schedule, nutrient totals, and clinical questions onto a crisp A4 report.

---

## 5. Complete Pre-Loaded Datasets (Ready to Embed)

### A. Master Food Database (Per 100 g or 1 Standard Unit — IFCT 2017 & USDA)

| ID | Food Name | Category | Base Unit | kcal | Prot (g) | Carbs (g) | Fat (g) | SatFat (g) | Chol (mg) | Fibre (g) | Sod (mg) | Calc (mg) | Phos (mg) | Iron (mg) | Potas (mg) | Mag (mg) | Zinc (mg) | B12 (mcg) | VitC (mg) | VitK (mcg) | VitD (mcg) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `egg_whole` | Whole Egg, boiled | Eggs & Dairy | 1 egg (50g) | 78 | 6.3 | 0.6 | 5.3 | 1.6 | 185 | 0 | 62 | 25 | 86 | 0.6 | 63 | 5 | 0.55 | 0.55 | 0 | 0.15 | 1.0 |
| `egg_white` | Egg White, boiled | Eggs & Dairy | 1 white (35g) | 17 | 3.7 | 0.2 | 0.05 | 0 | 0 | 0 | 56 | 2 | 6 | 0.03 | 55 | 4 | 0.01 | 0.03 | 0 | 0 | 0 |
| `curd` | Curd (Dahi), toned | Eggs & Dairy | 100 g | 60 | 3.1 | 4.0 | 3.0 | 2.0 | 10 | 0 | 40 | 120 | 93 | 0.1 | 150 | 12 | 0.5 | 0.4 | 0 | 0.2 | 0 |
| `milk_toned` | Toned Milk (3% fat) | Eggs & Dairy | 100 ml | 58 | 3.2 | 4.8 | 3.0 | 1.9 | 10 | 0 | 44 | 118 | 92 | 0.1 | 145 | 11 | 0.4 | 0.4 | 0.5 | 0.2 | 0.05 |
| `pomegranate` | Pomegranate | Fruits | 100 g | 83 | 1.7 | 19.0 | 1.2 | 0.1 | 0 | 4.0 | 3 | 10 | 36 | 0.3 | 236 | 12 | 0.4 | 0 | 10 | 16.0 | 0 |
| `banana_yelakki` | Banana (Yelakki, ~2-3 small) | Fruits | 100 g | 89 | 1.1 | 23.0 | 0.3 | 0.1 | 0 | 2.6 | 1 | 5 | 22 | 0.3 | 358 | 27 | 0.2 | 0 | 9 | 0.5 | 0 |
| `papaya` | Papaya, ripe | Fruits | 100 g | 43 | 0.5 | 11.0 | 0.3 | 0.1 | 0 | 1.7 | 8 | 20 | 10 | 0.3 | 182 | 21 | 0.1 | 0 | 61 | 2.6 | 0 |
| `sapota` | Sapota (Chikoo) | Fruits | 100 g | 83 | 0.4 | 20.0 | 1.1 | 0.2 | 0 | 5.3 | 12 | 21 | 12 | 0.8 | 193 | 12 | 0.1 | 0 | 15 | 0 | 0 |
| `guava` | Guava | Fruits | 100 g | 68 | 2.6 | 14.0 | 1.0 | 0.3 | 0 | 5.4 | 2 | 18 | 40 | 0.3 | 417 | 22 | 0.2 | 0 | 228 | 2.6 | 0 |
| `apple` | Apple | Fruits | 100 g | 52 | 0.3 | 14.0 | 0.2 | 0 | 0 | 2.4 | 1 | 6 | 11 | 0.1 | 107 | 5 | 0.04 | 0 | 5 | 2.2 | 0 |
| `orange` | Orange | Fruits | 100 g | 47 | 0.9 | 12.0 | 0.1 | 0 | 0 | 2.4 | 0 | 40 | 14 | 0.1 | 181 | 10 | 0.1 | 0 | 53 | 0 | 0 |
| `pineapple` | Pineapple | Fruits | 100 g | 50 | 0.5 | 13.0 | 0.1 | 0 | 0 | 1.4 | 1 | 13 | 8 | 0.3 | 109 | 12 | 0.1 | 0 | 48 | 0.7 | 0 |
| `ragi_dosa` | Ragi Dosa (25g flour + 0.5 tsp oil) | Grains & Dosa | 1 dosa | 102.5 | 2.0 | 18.5 | 2.0 | 0.35 | 0 | 2.5 | 5 | 85 | 75 | 0.95 | 100 | 30 | 0.35 | 0 | 0 | 0.25 | 0 |
| `moong_dosa` | Moong Dosa (25g dal + 0.5 tsp oil) | Grains & Dosa | 1 dosa | 107.5 | 6.0 | 15.5 | 2.3 | 0.4 | 0 | 4.0 | 5 | 31 | 95 | 1.7 | 310 | 47.5 | 0.7 | 0 | 1 | 2.25 | 0 |
| `muesli` | Muesli, multigrain | Grains & Dosa | 100 g | 370 | 8.5 | 72.0 | 6.2 | 0.5 | 0 | 7.5 | 60 | 32 | 205 | 4.1 | 280 | 70 | 1.2 | 0 | 0 | 0 | 0 |
| `rice_cooked` | Rice, white cooked | Grains & Dosa | 100 g | 130 | 2.7 | 28.0 | 0.3 | 0.1 | 0 | 0.4 | 1 | 10 | 43 | 0.2 | 35 | 12 | 0.5 | 0 | 0 | 0 | 0 |
| `chapati` | Chapati / Phulka (whole wheat) | Grains & Dosa | 1 pc (35g) | 105 | 3.5 | 20.0 | 1.2 | 0.2 | 0 | 2.8 | 90 | 12 | 85 | 1.2 | 110 | 35 | 0.7 | 0 | 0 | 0.5 | 0 |
| `sambar` | Sambar (dal + veg) | Gravies & Dals | 100 ml | 60 | 3.0 | 8.0 | 2.0 | 0.4 | 0 | 2.0 | 200 | 30 | 60 | 1.0 | 233 | 23 | 0.47 | 0 | 4 | 5.3 | 0 |
| `keerai_masiyal` | Green Leaves Curry (Keerai Masiyal) | Gravies & Dals | 100 ml | 47 | 2.7 | 4.7 | 2.0 | 0.47 | 0 | 2.0 | 167 | 100 | 40 | 1.33 | 267 | 33 | 0.4 | 0 | 10 | 80.0 | 0 |
| `moong_dal_curry` | Moong Dal Curry | Gravies & Dals | 100 ml | 70 | 4.3 | 9.3 | 1.7 | 0.33 | 0 | 2.3 | 167 | 17 | 63 | 0.87 | 207 | 25 | 0.53 | 0 | 1.3 | 2.0 | 0 |
| `rasam` | Rasam | Gravies & Dals | 100 ml | 23 | 0.8 | 3.3 | 0.8 | 0.2 | 0 | 0.5 | 233 | 10 | 17 | 0.4 | 100 | 8 | 0.13 | 0 | 3.3 | 1.3 | 0 |
| `vatha_kuzhambu` | Vatha / Kara Kuzhambu | Gravies & Dals | 100 ml | 73 | 1.3 | 8.7 | 4.0 | 0.67 | 0 | 1.3 | 253 | 27 | 27 | 1.0 | 167 | 17 | 0.27 | 0 | 2.7 | 2.0 | 0 |
| `mor_kuzhambu` | Mor Kuzhambu | Gravies & Dals | 100 ml | 60 | 2.0 | 4.0 | 4.0 | 2.33 | 6.7 | 0.67 | 200 | 67 | 53 | 0.27 | 100 | 10 | 0.27 | 0.2 | 1.3 | 1.3 | 0 |
| `kootu` | Kootu (Dal + Vegetable) | Gravies & Dals | 100 ml | 67 | 3.3 | 7.3 | 2.7 | 1.2 | 0 | 2.3 | 200 | 30 | 60 | 1.0 | 220 | 23 | 0.47 | 0 | 4 | 4.0 | 0 |
| `chicken_breast` | Chicken Breast, cooked | Proteins | 100 g | 165 | 31.0 | 0 | 3.6 | 1.0 | 85 | 0 | 74 | 15 | 228 | 1.0 | 256 | 29 | 1.0 | 0.3 | 0 | 0.3 | 0.1 |
| `soy_chunks` | Soy Chunks (dry weight) | Proteins | 100 g | 346 | 52.0 | 33.0 | 0.6 | 0.1 | 0 | 13.0 | 20 | 270 | 660 | 9.2 | 2000 | 260 | 5.0 | 0 | 0 | 2.0 | 0 |
| `paneer` | Paneer (cottage cheese) | Proteins | 100 g | 280 | 18.0 | 2.0 | 21.0 | 13.0 | 70 | 0 | 40 | 250 | 260 | 0.2 | 80 | 16 | 2.0 | 0.8 | 0 | 2.0 | 0.2 |
| `french_beans` | French Beans | Vegetables | 100 g | 31 | 1.8 | 7.0 | 0.2 | 0.1 | 0 | 3.4 | 6 | 37 | 38 | 1.0 | 211 | 25 | 0.2 | 0 | 16 | 14.0 | 0 |
| `carrot` | Carrot | Vegetables | 100 g | 41 | 0.9 | 10.0 | 0.2 | 0 | 0 | 2.8 | 69 | 33 | 35 | 0.3 | 320 | 12 | 0.2 | 0 | 6 | 13.0 | 0 |
| `keerai_poriyal` | Greens (Keerai Poriyal, cooked) | Vegetables | 100 g | 65 | 3.2 | 5.0 | 3.5 | 1.5 | 0 | 3.5 | 120 | 160 | 55 | 2.2 | 380 | 55 | 0.6 | 0 | 12 | 140.0 | 0 |
| `beetroot` | Beetroot | Vegetables | 100 g | 43 | 1.6 | 10.0 | 0.2 | 0 | 0 | 2.8 | 78 | 16 | 40 | 0.8 | 325 | 23 | 0.4 | 0 | 5 | 0.2 | 0 |
| `drumstick_pods` | Drumstick Pods | Vegetables | 100 g | 37 | 2.1 | 8.5 | 0.2 | 0.1 | 0 | 3.2 | 42 | 30 | 50 | 0.4 | 461 | 45 | 0.5 | 0 | 141 | 0 | 0 |
| `cabbage` | Cabbage | Vegetables | 100 g | 25 | 1.3 | 6.0 | 0.1 | 0 | 0 | 2.5 | 18 | 40 | 26 | 0.5 | 170 | 12 | 0.2 | 0 | 36 | 76.0 | 0 |
| `ladies_finger` | Ladies Finger (Okra) | Vegetables | 100 g | 33 | 1.9 | 7.5 | 0.2 | 0 | 0 | 3.2 | 7 | 82 | 61 | 0.6 | 299 | 57 | 0.6 | 0 | 23 | 31.0 | 0 |
| `brinjal` | Brinjal | Vegetables | 100 g | 25 | 1.0 | 6.0 | 0.2 | 0 | 0 | 3.0 | 2 | 9 | 24 | 0.2 | 229 | 14 | 0.2 | 0 | 2 | 3.5 | 0 |
| `pumpkin` | Pumpkin | Vegetables | 100 g | 26 | 1.0 | 6.5 | 0.1 | 0 | 0 | 0.5 | 1 | 21 | 44 | 0.8 | 340 | 12 | 0.3 | 0 | 9 | 1.1 | 0 |
| `cluster_beans` | Cluster Beans | Vegetables | 100 g | 44 | 3.2 | 10.0 | 0.4 | 0.1 | 0 | 4.5 | 15 | 130 | 57 | 1.1 | 200 | 50 | 0.5 | 0 | 49 | 15.0 | 0 |
| `bottle_gourd` | Bottle Gourd | Vegetables | 100 g | 14 | 0.6 | 3.4 | 0 | 0 | 0 | 0.5 | 2 | 26 | 10 | 0.2 | 150 | 11 | 0.7 | 0 | 10 | 3.0 | 0 |

---

### B. Pre-Loaded Saved Diet Plan Templates (Starter Pack)
Pre-seed the app with **4 distinct named templates** so the user immediately experiences switching and comparing multiple plans:
1. **`Plan A: High-Calcium Bone Focus`**
   - *Morning:* `1 Whole Egg + 1 Egg White`, `Pomegranate (100g)`, `Banana Yelakki (100g)`, `Papaya (100g)`, `Ragi Dosa ×2`
   - *Afternoon:* `Rice (70g)`, `Keerai Masiyal (150ml)`, `Soy Chunks (50g dry)`, `Keerai Poriyal (100g)`, `Curd (15g)`
   - *Night:* `Ragi Dosa ×2`, `Sambar (150ml)`
   - *Lifestyle:* `2250 ml Water`, `20 mins Sunlight`
2. **`Plan B: High-Protein Lean Day`**
   - *Morning:* `1 Whole Egg + 1 Egg White`, `Pomegranate (100g)`, `Banana Yelakki (100g)`, `Guava (100g)`, `Moong Dosa ×2`
   - *Afternoon:* `Rice (70g)`, `Sambar (150ml)`, `Chicken Breast (100g)`, `French Beans (100g)`, `Curd (15g)`
   - *Night:* `Chapati ×2 (70g)`, `Moong Dal Curry (150ml)`
   - *Lifestyle:* `2250 ml Water`, `20 mins Sunlight`
3. **`Plan C: Vegetarian Paneer & Dal`**
   - *Morning:* `1 Whole Egg + 1 Egg White`, `Pomegranate (100g)`, `Banana Yelakki (100g)`, `Sapota (100g)`, `Ragi Dosa ×2`
   - *Afternoon:* `Rice (70g)`, `Moong Dal Curry (150ml)`, `Paneer (50g)`, `Carrot (100g)`, `Curd (15g)`
   - *Night:* `Muesli (40g) + Toned Milk (150ml)`
   - *Lifestyle:* `2000 ml Water`, `15 mins Sunlight`
4. **`Plan D: Light Iron & Antioxidant Boost`**
   - *Morning:* `1 Whole Egg + 1 Egg White`, `Pomegranate (100g)`, `Banana Yelakki (100g)`, `Guava (100g)`, `Moong Dosa ×2`
   - *Afternoon:* `Rice (70g)`, `Keerai Masiyal (150ml)`, `Soy Chunks (50g dry)`, `Beetroot (100g)`, `Curd (15g)`
   - *Night:* `Chapati ×2 (70g)`, `Kootu (150ml)`
   - *Lifestyle:* `2500 ml Water`, `25 mins Sunlight`

---

## 6. Agent Execution Checklist
When instructing your coding agent, verify these implementation details before completion:
- [ ] **Single-Page / Zero-Build or Clean Vite Structure:** Works cleanly when served locally or deployed on GitHub Pages / Vercel / Netlify with valid `manifest.json` and `sw.js` registration.
- [ ] **Accurate Portion Math:** Every prepped item computes nutrients dynamically as `(Master_Item_Nutrient * Portion_Weight_or_Qty) / Base_Unit_Size` rounded to 1 decimal place.
- [ ] **Responsive Mobile UX:** Bottom navigation bar on `< 768px` screens with `pb-24` clearance so sticky bottom bars never cover content; horizontal scroll wrappers for wide comparison tables.
- [ ] **Medical Disclaimer Footer:** Subtle, non-intrusive clinical note reminding the user that values follow ICMR-NIN 2020 & IFCT 2017 references and supplement dosages (Calcium + Vitamin D3) must be confirmed by her treating doctor.