// All URLs are relative - Vite proxy forwards to backend

export interface ClothingRecommendation {
  id: string;
  name: string;
  type: string;
  color: string;
  colorHex: string;
  match_score: number;
  reason: string;
  image_base64: string;
  category: string;
  gender: string;
  price: string;
  rating: number;
}

export interface AnalysisResult {
  gender: string;
  body_coverage: string;
  pose_stance: string;
  body_build_estimate: string;
  suitable_clothing_types: string[];
  confidence: number;
  recommendations: ClothingRecommendation[];
}

export interface TryOnResponse {
  result_image_base64: string;
  pose_detected: boolean;
  analysis: AnalysisResult;
  processing_time_ms: number;
}

export async function tryOnClothing(
  userImageBase64: string,
  clothingImageBase64: string
): Promise<TryOnResponse> {
  var response = await fetch("/api/v1/tryon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_image_base64: userImageBase64,
      clothing_image_base64: clothingImageBase64,
    }),
  });
  if (!response.ok) {
    var errData = await response.json().catch(function() { return {}; });
    throw new Error(errData.detail || "Server error: " + response.status);
  }
  return await response.json();
}

export async function analyzeBody(userImageBase64: string): Promise<AnalysisResult> {
  var response = await fetch("/api/v1/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_image_base64: userImageBase64 }),
  });
  if (!response.ok) {
    var errData = await response.json().catch(function() { return {}; });
    throw new Error(errData.detail || "Server error: " + response.status);
  }
  return await response.json();
}

export function generateCatalog(): ClothingRecommendation[] {
  var maleTypes = ["T-Shirt", "Jacket", "Hoodie", "Blazer", "Polo", "Shirt", "Vest", "Coat", "Sweater", "Cardigan", "Windbreaker", "Denim Jacket", "Leather Jacket", "Bomber", "Parka", "Flannel", "Henley", "Tank Top", "Puffer Jacket", "Sport Coat"];
  var femaleTypes = ["Blouse", "Dress", "Cardigan", "Top", "Jacket", "Skirt", "Jumpsuit", "Tunic", "Crop Top", "Wrap Top", "Blazer", "Coat", "Sweater", "Hoodie", "Peplum", "Kimono", "Cami", "Trench Coat", "Maxi Dress", "Mini Dress"];
  var colors = [
    { name: "Crimson", hex: "#DC2626" }, { name: "Ocean Blue", hex: "#2563EB" },
    { name: "Forest", hex: "#16A34A" }, { name: "Royal Purple", hex: "#7C3AED" },
    { name: "Sunset", hex: "#EA580C" }, { name: "Rose", hex: "#E11D48" },
    { name: "Teal", hex: "#0D9488" }, { name: "Amber", hex: "#D97706" },
    { name: "Indigo", hex: "#4F46E5" }, { name: "Emerald", hex: "#059669" },
    { name: "Slate", hex: "#475569" }, { name: "Pink", hex: "#EC4899" },
    { name: "Cyan", hex: "#06B6D4" }, { name: "Lime", hex: "#65A30D" },
    { name: "Fuchsia", hex: "#C026D3" }, { name: "Navy", hex: "#1E3A5F" },
    { name: "Coral", hex: "#F87171" }, { name: "Mint", hex: "#34D399" },
    { name: "Lavender", hex: "#A78BFA" }, { name: "Charcoal", hex: "#374151" },
  ];
  var builds = ["slim", "average", "athletic", "heavy", "petite", "tall"];
  var prices = ["$19.99", "$24.99", "$29.99", "$34.99", "$39.99", "$44.99", "$49.99", "$54.99", "$59.99", "$64.99", "$69.99", "$74.99", "$79.99", "$89.99", "$99.99"];
  var items: ClothingRecommendation[] = [];
  var id = 0;
  for (var m = 0; m < maleTypes.length; m++) {
    for (var c = 0; c < colors.length; c++) {
      for (var k = 0; k < 3; k++) {
        id++;
        items.push({
          id: "m-" + id, name: maleTypes[m] + " - " + colors[c].name,
          type: maleTypes[m].toLowerCase(), color: colors[c].name, colorHex: colors[c].hex,
          match_score: 50 + Math.floor(Math.random() * 50),
          reason: "Perfect for " + builds[Math.floor(Math.random() * builds.length)] + " build",
          image_base64: "", category: maleTypes[m].toLowerCase(), gender: "male",
          price: prices[Math.floor(Math.random() * prices.length)],
          rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        });
      }
    }
  }
  id = 0;
  for (var f = 0; f < femaleTypes.length; f++) {
    for (var c2 = 0; c2 < colors.length; c2++) {
      for (var k2 = 0; k2 < 3; k2++) {
        id++;
        items.push({
          id: "f-" + id, name: femaleTypes[f] + " - " + colors[c2].name,
          type: femaleTypes[f].toLowerCase(), color: colors[c2].name, colorHex: colors[c2].hex,
          match_score: 50 + Math.floor(Math.random() * 50),
          reason: "Great for " + builds[Math.floor(Math.random() * builds.length)] + " build",
          image_base64: "", category: femaleTypes[f].toLowerCase(), gender: "female",
          price: prices[Math.floor(Math.random() * prices.length)],
          rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        });
      }
    }
  }
  return items;
}

export function simulateAnalysis(): AnalysisResult {
  var genders = ["male", "female"];
  var gender = genders[Math.floor(Math.random() * 2)];
  var builds = ["slim", "average", "athletic", "heavy"];
  var build = builds[Math.floor(Math.random() * builds.length)];
  var stances = ["standing", "sitting", "half-turn"];
  var stance = stances[Math.floor(Math.random() * stances.length)];
  var allItems = generateCatalog();
  var genderItems = allItems.filter(function(x) { return x.gender === gender; });
  var topItems = genderItems.sort(function(a, b) { return b.match_score - a.match_score; }).slice(0, 5);
  var types = gender === "male"
    ? ["t-shirt", "jacket", "hoodie", "blazer", "polo"]
    : ["blouse", "dress", "cardigan", "top", "jacket"];
  return {
    gender: gender, body_coverage: "upper_body", pose_stance: stance,
    body_build_estimate: build, suitable_clothing_types: types,
    confidence: Math.round(82 + Math.random() * 16), recommendations: topItems,
  };
}

export function simulateTryOn(userImageBase64: string): TryOnResponse {
  var analysis = simulateAnalysis();
  return {
    result_image_base64: userImageBase64, pose_detected: true,
    analysis: analysis, processing_time_ms: Math.round(800 + Math.random() * 1200),
  };
}
