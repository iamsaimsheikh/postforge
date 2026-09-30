import satori from "satori";
import sharp from "sharp";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadConfig, type CardData } from "./config.js";
import { PhotoCard } from "./templates/photo-card.js";

interface ImageSize {
  width: number;
  height: number;
}

const SIZES = {
  linkedin: { width: 1200, height: 1200 },
  x: { width: 1200, height: 675 },
  instagram: { width: 1080, height: 1350 },
};

interface GradientMood {
  name: string;
  colorTop: string;
  colorBottom: string;
}

const MOODS: GradientMood[] = [
  { name: "deep-navy", colorTop: "rgba(10, 20, 50, 0.15)", colorBottom: "rgba(11, 20, 38, 0.92)" },
  { name: "steel", colorTop: "rgba(15, 20, 30, 0.1)", colorBottom: "rgba(20, 30, 50, 0.90)" },
  { name: "ocean", colorTop: "rgba(5, 15, 40, 0.15)", colorBottom: "rgba(8, 25, 55, 0.92)" },
  { name: "slate", colorTop: "rgba(20, 25, 35, 0.1)", colorBottom: "rgba(15, 20, 30, 0.88)" },
  { name: "midnight", colorTop: "rgba(5, 5, 20, 0.12)", colorBottom: "rgba(8, 8, 22, 0.90)" },
  { name: "charcoal", colorTop: "rgba(10, 10, 12, 0.1)", colorBottom: "rgba(12, 14, 18, 0.90)" },
];

let moodIndex = 0;

function pickMood(): GradientMood {
  const mood = MOODS[moodIndex % MOODS.length];
  moodIndex++;
  return mood;
}

const usedPhotos = new Set<string>();

async function loadPhoto(size: ImageSize): Promise<{ dataUri: string; mood: GradientMood } | undefined> {
  const photosDir = join(process.cwd(), "photos");

  try {
    const categories = readdirSync(photosDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    if (categories.length === 0) {
      const files = readdirSync(photosDir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
      if (files.length === 0) return undefined;

      let picked = files[Math.floor(Math.random() * files.length)];
      for (const f of files) {
        if (!usedPhotos.has(f)) { picked = f; break; }
      }
      usedPhotos.add(picked);
      if (usedPhotos.size > 12) usedPhotos.clear();

      const buf = await sharp(join(photosDir, picked))
        .resize(size.width, size.height, { fit: "cover", position: "centre" })
        .modulate({ brightness: 0.85 })
        .jpeg({ quality: 75 })
        .toBuffer();

      return { dataUri: `data:image/jpeg;base64,${buf.toString("base64")}`, mood: pickMood() };
    }

    const cat = categories[Math.floor(Math.random() * categories.length)];
    const catDir = join(photosDir, cat);
    const files = readdirSync(catDir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
    if (files.length === 0) return undefined;

    let picked = files[Math.floor(Math.random() * files.length)];
    for (const f of files) {
      if (!usedPhotos.has(`${cat}/${f}`)) { picked = f; break; }
    }
    usedPhotos.add(`${cat}/${picked}`);
    if (usedPhotos.size > 15) usedPhotos.clear();

    const buf = await sharp(join(catDir, picked))
      .resize(size.width, size.height, { fit: "cover", position: "centre" })
      .modulate({ brightness: 0.85 })
      .jpeg({ quality: 75 })
      .toBuffer();

    console.log(`[postforge] Photo loaded: ${cat}/${picked} (${(buf.length / 1024).toFixed(0)}KB)`);
    return { dataUri: `data:image/jpeg;base64,${buf.toString("base64")}`, mood: pickMood() };
  } catch {
    return undefined;
  }
}

let _fonts: { name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: "normal" | "italic" }[] | null = null;

async function loadFonts() {
  if (_fonts) return _fonts;

  const fontsDir = join(process.cwd(), "fonts");
  const fallbackDir = join(import.meta.dirname, "..", "assets");

  _fonts = [];

  const tryLoad = (dir: string, file: string, name: string, weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900) => {
    try {
      const data = readFileSync(join(dir, file));
      _fonts!.push({ name, data: data.buffer as ArrayBuffer, weight, style: "normal" });
      return true;
    } catch {
      return false;
    }
  };

  if (!tryLoad(fontsDir, "Inter-Regular.ttf", "Inter", 400)) {
    tryLoad(fallbackDir, "Inter-Regular.ttf", "Inter", 400);
  }
  if (!tryLoad(fontsDir, "Inter-Bold.ttf", "Inter", 700)) {
    tryLoad(fallbackDir, "Inter-Bold.ttf", "Inter", 700);
  }
  if (!tryLoad(fontsDir, "Poppins-Bold.ttf", "Poppins", 700)) {
    tryLoad(fallbackDir, "Poppins-Bold.ttf", "Poppins", 700);
  }

  if (_fonts.length === 0) {
    console.error("[postforge] No fonts found. Add .ttf files to a fonts/ directory or run setup.");
    console.error("[postforge] Required: Inter-Regular.ttf, Inter-Bold.ttf, Poppins-Bold.ttf");
    console.error("[postforge] Download from https://fonts.google.com/specimen/Inter and https://fonts.google.com/specimen/Poppins");
    process.exit(1);
  }

  return _fonts;
}

async function renderCard(data: CardData, size: ImageSize): Promise<Buffer> {
  const config = loadConfig();
  const fonts = await loadFonts();
  const photo = await loadPhoto(size);

  if (!photo) {
    console.warn("[postforge] No photos found. Add images to the photos/ directory.");
    console.warn("[postforge] Rendering with solid background instead.");
  }

  const jsx = PhotoCard({
    data,
    size,
    photoSrc: photo?.dataUri ?? "",
    mood: photo?.mood ?? MOODS[0],
    accent: config.brand.accent,
    footerLabel: config.name,
  });

  const svg = await satori(jsx as React.ReactNode, {
    width: size.width,
    height: size.height,
    fonts,
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function renderAllCards(data: CardData): Promise<{ linkedin: Buffer; x: Buffer; instagram: Buffer }> {
  console.log("[postforge] Rendering cards...");

  const [linkedin, x, instagram] = await Promise.all([
    renderCard(data, SIZES.linkedin),
    renderCard(data, SIZES.x),
    renderCard(data, SIZES.instagram),
  ]);

  console.log(
    `[postforge] Cards rendered: LinkedIn ${(linkedin.length / 1024).toFixed(0)}KB, X ${(x.length / 1024).toFixed(0)}KB, IG ${(instagram.length / 1024).toFixed(0)}KB`,
  );

  return { linkedin, x, instagram };
}
