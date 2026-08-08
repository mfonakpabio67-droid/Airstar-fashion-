import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// NOTE: Only used by dev-time tooling; avoid import.meta usage in CJS bundling.
// Keep simple & deterministic for runtime path resolution.
const __dirname = process.cwd();



const dbPath = path.join(process.cwd(), "src", "db.json");
let dbCacheMtime = 0;

// Robust dynamic loading of initialDb from json file
let initialDb: any;
try {
  initialDb = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
} catch (e) {
  console.error("Failed to read src/db.json", e);
  initialDb = { collections: [], measurements: [], orders: [], appointments: [], inventory: [], enquiries: [] };
}

// In-memory cache for database (critical for serverless / read-only Vercel environment)
let dbInMemory: any = null;

// Safe helper to read DB
function readDatabase() {
  // Skip filesystem on Vercel read-only serverless environment
  if (process.env.VERCEL) {
    if (dbInMemory) return dbInMemory;
    dbInMemory = JSON.parse(JSON.stringify(initialDb));
    return dbInMemory;
  }

  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      if (dbInMemory && dbCacheMtime === stats.mtimeMs) return dbInMemory;

      const data = fs.readFileSync(dbPath, "utf-8");
      dbInMemory = JSON.parse(data);
      dbCacheMtime = stats.mtimeMs;
      return dbInMemory;
    }
  } catch (err) {
    console.error("Error reading database file, falling back to bundled data:", err);
  }
  // Fallback to statically bundled initialDb
  dbInMemory = JSON.parse(JSON.stringify(initialDb));
  dbCacheMtime = Date.now();
  return dbInMemory;
}

// Safe helper to write DB
function writeDatabase(data: any) {
  dbInMemory = data;
  dbCacheMtime = Date.now();

  // Skip filesystem write on Vercel read-only serverless environment
  if (process.env.VERCEL) {
    return true;
  }

  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing database file (using in-memory fallback):", err);
    return true; // Return true as memory cache is updated successfully
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;


// Middleware
app.use(express.json());
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  next();
});

// Serve static assets from src/assets directly in both dev and production
app.use("/src/assets", express.static(path.join(process.cwd(), "src", "assets")));
app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));
app.use("/assets", express.static(path.join(process.cwd(), "src", "assets")));
app.use("/assets", express.static(path.join(process.cwd(), "dist", "assets")));

// Log incoming requests
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API ROUTES ---

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// GET Collections
app.get("/api/collections", (_req, res) => {
  const db = readDatabase();
  res.json(db.collections || []);
});

// GET Measurements
app.get("/api/measurements", (_req, res) => {
  const db = readDatabase();
  res.json(db.measurements || []);
});

// POST Measurements
app.post("/api/measurements", (req, res) => {
  const db = readDatabase();
  const newProfile = {
    id: "meas-" + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  db.measurements = db.measurements || [];
  db.measurements.push(newProfile);
  writeDatabase(db);
  res.status(201).json(newProfile);
});

// GET Orders
app.get("/api/orders", (_req, res) => {
  const db = readDatabase();
  res.json(db.orders || []);
});

// POST Orders
app.post("/api/orders", (req, res) => {
  const db = readDatabase();
  db.orders = db.orders || [];

  const uniqueOrderNumber = `AFH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: "ord-" + Date.now(),
    orderNumber: uniqueOrderNumber,
    status: "ORDER_RECEIVED",
    progressPercentage: 5,
    createdAt: new Date().toISOString(),
    statusHistory: [
      {
        status: "ORDER_RECEIVED",
        updatedAt: new Date().toISOString(),
        notes: "Couture order placed and checked into Airstar systems."
      }
    ],
    ...req.body
  };

  db.orders.push(newOrder);
  writeDatabase(db);
  res.status(201).json(newOrder);
});

// PATCH Orders (Status, Notes, Progress)
app.patch("/api/orders/:id", (req, res) => {
  const db = readDatabase();
  const orderId = req.params.id;
  const { status, progressPercentage, notes } = req.body;

  db.orders = db.orders || [];
  const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = db.orders[orderIndex];
  if (status && status !== order.status) {
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      updatedAt: new Date().toISOString(),
      notes: notes || `Order stage transitioned to ${status.replace(/_/g, " ")}.`
    });
  }

  if (typeof progressPercentage === "number") {
    order.progressPercentage = progressPercentage;
  }

  db.orders[orderIndex] = order;
  writeDatabase(db);
  res.json(order);
});

// GET Appointments
app.get("/api/appointments", (_req, res) => {
  const db = readDatabase();
  res.json(db.appointments || []);
});

// POST Appointments
app.post("/api/appointments", (req, res) => {
  const db = readDatabase();
  db.appointments = db.appointments || [];

  // Conflict Check
  const { startTime, endTime } = req.body;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  const hasConflict = db.appointments.some((appt: any) => {
    if (appt.status === "CANCELLED") return false;
    const apptStart = new Date(appt.startTime).getTime();
    const apptEnd = new Date(appt.endTime).getTime();
    return start < apptEnd && end > apptStart;
  });

  if (hasConflict) {
    return res.status(409).json({
      error: "Scheduling conflict detected. The requested fitting slot is already reserved by another client."
    });
  }

  const newAppt = {
    id: "appt-" + Date.now(),
    status: "PENDING",
    createdAt: new Date().toISOString(),
    ...req.body
  };

  db.appointments.push(newAppt);
  writeDatabase(db);
  res.status(201).json(newAppt);
});

// PATCH Appointments (Approval, Reschedule, Cancellation)
app.patch("/api/appointments/:id", (req, res) => {
  const db = readDatabase();
  const apptId = req.params.id;
  const { status, startTime, endTime, notes } = req.body;

  db.appointments = db.appointments || [];
  const apptIndex = db.appointments.findIndex((a: any) => a.id === apptId);

  if (apptIndex === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const appt = db.appointments[apptIndex];
  if (status) appt.status = status;
  if (startTime) appt.startTime = startTime;
  if (endTime) appt.endTime = endTime;
  if (notes) appt.notes = notes;

  db.appointments[apptIndex] = appt;
  writeDatabase(db);
  res.json(appt);
});

// GET Inventory
app.get("/api/inventory", (_req, res) => {
  const db = readDatabase();
  res.json(db.inventory || []);
});

// POST Inventory Item
app.post("/api/inventory", (req, res) => {
  const db = readDatabase();
  db.inventory = db.inventory || [];

  const newItem = {
    id: "inv-" + Date.now(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };

  db.inventory.push(newItem);
  writeDatabase(db);
  res.status(201).json(newItem);
});

// PATCH Inventory Item (Stock check, low stock alert adjustments)
app.patch("/api/inventory/:id", (req, res) => {
  const db = readDatabase();
  const invId = req.params.id;
  const { quantity, lowStockAlert } = req.body;

  db.inventory = db.inventory || [];
  const itemIndex = db.inventory.findIndex((i: any) => i.id === invId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: "Material item not found" });
  }

  const item = db.inventory[itemIndex];
  if (typeof quantity === "number") item.quantity = quantity;
  if (typeof lowStockAlert === "number") item.lowStockAlert = lowStockAlert;
  item.updatedAt = new Date().toISOString();

  db.inventory[itemIndex] = item;
  writeDatabase(db);
  res.json(item);
});

// GET Enquiries
app.get("/api/enquiries", (_req, res) => {
  const db = readDatabase();
  res.json(db.enquiries || []);
});

// POST Enquiries
app.post("/api/enquiries", (req, res) => {
  const db = readDatabase();
  db.enquiries = db.enquiries || [];

  const newEnquiry = {
    id: "enq-" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "PENDING",
    ...req.body
  };

  db.enquiries.push(newEnquiry);
  writeDatabase(db);
  res.status(201).json(newEnquiry);
});

// PATCH Enquiries status
app.patch("/api/enquiries/:id", (req, res) => {
  const db = readDatabase();
  const enqId = req.params.id;
  const { status } = req.body;

  db.enquiries = db.enquiries || [];
  const enqIndex = db.enquiries.findIndex((e: any) => e.id === enqId);

  if (enqIndex === -1) {
    return res.status(404).json({ error: "Enquiry not found" });
  }

  if (status) {
    db.enquiries[enqIndex].status = status;
  }

  writeDatabase(db);
  res.json(db.enquiries[enqIndex]);
});

// POST AI Stylist API (Gemini-3.5-flash server-side call)
app.post("/api/ai-stylist", async (req, res) => {
  const { category, fabric, color, occasion, silhouette, specialInstructions } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Safe, highly detailed rule-based luxury response if API key is not yet set
      return res.json({
        text: `### Airstar Haute Couture Consultation

*Thank you for consulting the Airstar Fashion Home design desk. Your couture preferences are magnificent!*

**1. DESIGN SYNERGY & SILHOUETTE FLATS**
Pairing the elegant **${silhouette || "Cathedral Floor-Length Gown"}** silhouette with **${fabric || "Akwa Ibom Chantilly Lace"}** for a **${occasion || "High Society Event"}** is an absolute masterclass in luxury. The drape will fall beautifully along the body lines, creating a flattering, sweeping outline.

**2. COLOUR COORDINATES & SPECTRUMS**
For your chosen **${color || "Ivory White / Gold"}** base palette, we recommend:
*   **Accents**: Champagne gold or soft metallic rose accents.
*   **Jewelry**: Warm-toned drop-pearl earrings or an artistic gold choker.
*   **Headtie / Gele (for traditional events)**: A customized metallic champagne Gele with fine stone embellishments.

**3. TAILORING WORKROOM DIRECTIVES**
*   **Boning & Corsetry**: Incorporate internal multi-panel satin casing steel boning for tailored chest and waist support.
*   **Lining Style**: Double lining in Silk Habotai to ensure an ultra-smooth skin-touch and block see-through areas under cameras.
*   **Hem Finish**: Hem weighted with horsehair braid to keep the sweeping outline crisp.

**4. COUTURE SWATCH CARE GUIDE**
*   **Cleaning**: Dry clean only using preservation specialists.
*   **Storage**: Hang flat on padded wooden hangers in breathable linen garment bags. Keep away from humidity.`
      });
    }

    const prompt = `You are the chief master stylist and creative director at Airstar Fashion Home, a premium luxury tailoring house exclusively for fine women's fashion and bespoke bridal wear.
Analyze the following custom tailoring configuration request:
- Category: ${category || 'Bridal/Luxury Evening wear'}
- Base Fabric: ${fabric || 'Akwa Ibom Chantilly Lace'}
- Color Palette: ${color || 'Champagne gold'}
- Silhouette style: ${silhouette || 'Mermaid style with cathedral train'}
- Occasion context: ${occasion || 'Luxury wedding/gala reception'}
- Special Instructions: ${specialInstructions || 'None'}

Provide an elite, highly detailed, and professional styling evaluation, focusing on:
1. DESIGN SYNERGY: Assess if the selected fabric, color, and silhouette match the occasion and category perfectly. Highlight any potential structural or draping guidelines.
2. COLOR HARMONIES: Suggest specific accent tones (for jewelry, headties/Geles, or shoes) that create a high-contrast or subtle monochromatic glow.
3. ACCESSORY MATCHES: Suggest matching premium embellishments (beads, crystals, floral lace applique) and coordinates (clutches, veils, wraps).
4. TAILORING DIRECTIONS: Share precise technical drafting suggestions for the tailor (e.g. pattern line adjustments, boning, support layers, or hem drop points).
5. FABRIC CARE GUIDE: Provide care guidelines for the selected fabrics.

Maintain an elegant, luxurious, and encouraging tone, reflecting master-level expertise. Do not mention that you are an AI model. Address the user directly as a treasured client of Airstar Fashion Home. Format beautifully using markdown with section headers.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Stylist error:", error);
    res.status(500).json({ error: "Atelier AI is currently in active pattern review. Please try again soon." });
  }
});

// POST Support Chat (Gemini-3.5-flash conversational context proxy)
app.post("/api/support-chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Safe interactive support concierge response
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      let reply = "Welcome to Airstar Fashion Home. I am Esther, your personal concierge. We specialize exclusively in custom luxury women's fashion, bridal wear, and high-end tailoring. How may I elevate your style today?";
      if (lastUserMsg.toLowerCase().includes("measure")) {
        reply = "Of course! To submit your tailoring dimensions, go to the 'Bespoke Studio' tab, select 'Measurement Registry', and input your bust, waist, and other details. We will save your signature fit profile securely.";
      } else if (lastUserMsg.toLowerCase().includes("order") || lastUserMsg.toLowerCase().includes("custom")) {
        reply = "You can design custom outfits via our 'Bespoke Studio' and select 'Atelier Customizer'. Pick your category, fabric, neckline, sleeves, and submit. You can also upload custom inspiration designs!";
      } else if (lastUserMsg.toLowerCase().includes("bridal") || lastUserMsg.toLowerCase().includes("wedding")) {
        reply = "Our bridal collections feature the finest Akwa Ibom Chantilly Lace and Duchess Satin, designed for dramatic elegance. I highly recommend booking a 'Bridal Consultation' in the Appointments section so we can review sketches.";
      } else if (lastUserMsg.toLowerCase().includes("men") || lastUserMsg.toLowerCase().includes("boy")) {
        reply = "Airstar Fashion Home specializes exclusively in women's high fashion and tailoring. We do not design men's or children's clothing so that we can maintain our elite craft focused entirely on feminine elegance.";
      }
      return res.json({ text: reply });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are Esther, the luxury customer concierge at Airstar Fashion Home.
We are a premier digital women's fashion boutique and custom tailoring house.
Airstar Fashion Home details:
- Email: estherudoisang7@gmail.com
- Scope: STRICTLY women's high fashion, luxury bridal wear, traditional attire (Aso Ebi, Boubous, Kaftans, custom lace), corporate chic, church dresses, maternity couture, graduation & birthday gowns. We NEVER do men's, children's, or unisex apparel.
- Services: Browse curated high-end collections, book private measurement or fitting appointments, design fully custom bespoke dresses (via the Bespoke Builder), save sizing matrices, and track orders in real-time.
- Production phases: Order Received -> Design Review -> Fabric Selection -> Pattern Drafting -> Cutting -> Sewing -> First Fitting -> Alterations -> Quality Inspection -> Packaging -> Ready for Pickup -> Delivered.

Be extremely elegant, warm, supportive, and professional. Address the user with prestige, as if they are visiting an elite physical salon. Maintain strict focus on women's fashion. If they ask about men's, boys' or children's wear, politely explain that Airstar specializes exclusively in celebrating women's beauty and elegance. Keep replies concise and luxurious.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Support Chat error:", error);
    res.status(500).json({ error: "Our concierge desk is briefly offline reviewing fabric swatches. Please try again shortly." });
  }
});

// --- DEV & PRODUCTION BUILD PIPELINES ---
async function startServer() {
  if (process.env.VERCEL) {
    console.log("Running on Vercel environment - skipping local listen & Vite HMR.");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for lightning development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server linked to Express pipelines.");
  } else {
    // Production static folder configurations
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Airstar Fashion Home server running securely on port ${PORT}`);
  });
}

startServer();

export default app;
