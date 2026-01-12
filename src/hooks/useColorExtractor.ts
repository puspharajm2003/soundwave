import { useState, useEffect, useCallback } from "react";

interface ExtractedColors {
  dominant: string;
  vibrant: string;
  muted: string;
  background: string;
}

const defaultColors: ExtractedColors = {
  dominant: "hsl(187 100% 50%)",
  vibrant: "hsl(280 100% 65%)",
  muted: "hsl(240 8% 15%)",
  background: "hsl(240 15% 4%)",
};

export const useColorExtractor = (imageUrl: string | undefined) => {
  const [colors, setColors] = useState<ExtractedColors>(defaultColors);
  const [isLoading, setIsLoading] = useState(false);

  const extractColors = useCallback(async (url: string) => {
    if (!url) return defaultColors;

    setIsLoading(true);

    try {
      // Create a canvas to analyze the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return defaultColors;

      // Use a small sample for performance
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const { data } = imageData;

      // Analyze colors
      const colorCounts: Record<string, number> = {};
      let totalR = 0, totalG = 0, totalB = 0;
      let maxSaturation = 0;
      let vibrantColor = { r: 0, g: 0, b: 0 };

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalR += r;
        totalG += g;
        totalB += b;

        // Calculate saturation
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        if (saturation > maxSaturation && max > 50) {
          maxSaturation = saturation;
          vibrantColor = { r, g, b };
        }

        // Group similar colors
        const key = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      const pixelCount = data.length / 4;
      const avgR = Math.floor(totalR / pixelCount);
      const avgG = Math.floor(totalG / pixelCount);
      const avgB = Math.floor(totalB / pixelCount);

      // Find dominant color
      const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      const dominantKey = sortedColors[0]?.[0] || "0-0-0";
      const [dr, dg, db] = dominantKey.split("-").map((n) => parseInt(n) * 32 + 16);

      const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
          }
        }

        return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
      };

      return {
        dominant: rgbToHsl(dr, dg, db),
        vibrant: rgbToHsl(vibrantColor.r, vibrantColor.g, vibrantColor.b),
        muted: rgbToHsl(avgR * 0.3, avgG * 0.3, avgB * 0.3),
        background: `hsl(${Math.round(Math.atan2(avgB - avgR, avgG - avgR) * 180 / Math.PI + 180)} 30% 8%)`,
      };
    } catch (error) {
      console.error("Color extraction failed:", error);
      return defaultColors;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (imageUrl) {
      extractColors(imageUrl).then(setColors);
    }
  }, [imageUrl, extractColors]);

  return { colors, isLoading };
};
