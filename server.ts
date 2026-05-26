import express from "express";
import path from "path";
import dotenv from "dotenv";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize GoogleGenAI client
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via the Settings > Secrets configuration in AI Studio.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// REST API routes go FIRST
app.get("/api/check-domain", async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return res.status(400).json({ error: "Domain name query is required." });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");

    // Real DNS resolution to check if domain resolves to active entries
    const resolvePromise = new Promise<{ available: boolean; reason: string }>((resolve) => {
      dns.resolve(cleanDomain, "A", (err, addresses) => {
        if (!err && addresses && addresses.length > 0) {
          return resolve({ available: false, reason: "Registered (A-Record present)" });
        }

        dns.resolve(cleanDomain, "MX", (mxErr, mxAddresses) => {
          if (!mxErr && mxAddresses && mxAddresses.length > 0) {
            return resolve({ available: false, reason: "Registered (MX-Record present)" });
          }

          dns.lookup(cleanDomain, (lookupErr, address) => {
            if (!lookupErr && address) {
              return resolve({ available: false, reason: "Registered (Resolves to IP)" });
            }

            resolve({ available: true, reason: "No active DNS records detected" });
          });
        });
      });
    });

    const timeoutPromise = new Promise<{ available: boolean; reason: string }>((resolve) => {
      setTimeout(() => {
        resolve({ available: true, reason: "Check timed out (Likely DNS Inactive)" });
      }, 2500);
    });

    const result = await Promise.race([resolvePromise, timeoutPromise]);
    return res.json({ domain: cleanDomain, ...result });

  } catch (err: any) {
    console.error("Domain lookup error:", err);
    return res.json({ domain: String(req.query.domain), available: true, reason: "DNS error or unresolvable" });
  }
});

app.post("/api/generate-names", async (req, res) => {
  try {
    const { industry, keywords, nameStyle } = req.body;

    if (!industry || typeof industry !== "string" || !industry.trim()) {
      return res.status(400).json({ error: "Industry or niche input is required." });
    }

    const ai = getAiClient();

    const prompt = `Generate exactly 10 highly creative, highly professional, memorable, and unique startup names based on these inputs:
    - Industry/Niche: ${industry.trim()}
    - Keywords & Core Concepts: ${keywords ? keywords.trim() : "None specified"}
    - Style Theme: ${nameStyle || "Balanced blend"}

    Ensure each name suggestion is brandable, phonetic, easy to remember, and feels modern. Avoid generic words.
    For each name, provide:
    1. A memorable name (e.g. "Aura", "Scribe", "Loom")
    2. A crisp, catchy human-centric slogan
    3. A short, thoughtful brand rationale (explaining the naming strategy or metaphors behind this name in 1-2 sentences)
    4. A practical, clean domain idea
    5. A style category label (e.g., "Compound Word", "Abstract/Neologism", "Classic Metaphor", "Blended Portmanteau")`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: "Array of exactly 10 startup name suggestions",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The generated brand/startup name" },
                  slogan: { type: Type.STRING, description: "A catchy, relevant slogan for the startup" },
                  rationale: { type: Type.STRING, description: "The naming strategy or metaphors behind this name" },
                  domainIdea: { type: Type.STRING, description: "A highly viable domain name idea" },
                  category: { type: Type.STRING, description: "The classification of this name style" }
                },
                required: ["name", "slogan", "rationale", "domainIdea", "category"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    const jsonText = response.text ? response.text.trim() : "";
    if (!jsonText) {
      throw new Error("Empty response received from Gemini.");
    }

    const result = JSON.parse(jsonText);
    return res.json(result);

  } catch (error: any) {
    console.error("Error generating startup names:", error);
    return res.status(500).json({ error: error.message || "An unknown error occurred during name generation." });
  }
});

// Vite middleware integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
