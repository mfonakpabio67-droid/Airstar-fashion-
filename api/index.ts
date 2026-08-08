import express from "express";
import * as path from "path";
import * as fs from "fs";

// Robust dynamic loading of initialDb from bundled json file (api/db.json is bundled with the lambda)
const bundledDbPath = path.join(process.cwd(), "api", "db.json");
const srcDbPath = path.join(process.cwd(), "src", "db.json");
let initialDb: any;
try {
  // Prefer bundled api/db.json, fall back to src/db.json
  const dbPath = fs.existsSync(bundledDbPath) ? bundledDbPath : srcDbPath;
  initialDb = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
} catch (e) {
  console.error("Failed to read db.json", e);
  initialDb = { collections: [], measurements: [], orders: [], appointments: [], inventory: [], enquiries: [] };
}

// In-memory cache for database (critical for serverless / read-only Vercel environment)
let dbInMemory: any = null;

// Safe helper to read DB
function readDatabase() {
  if (dbInMemory) return dbInMemory;
  dbInMemory = JSON.parse(JSON.stringify(initialDb));
  return dbInMemory;
}

// Safe helper to write DB (in-memory only for serverless)
function writeDatabase(data: any) {
  dbInMemory = data;
  return true;
}

const app = express();

// Middleware
app.use(express.json());
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
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

// POST AI Stylist API (rule-based fallback)
app.post("/api/ai-stylist", async (req, res) => {
  const { silhouette, fabric, occasion, color } = req.body;
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
*   **Hem Finish**: Hem weighted with horsehair braid to keep the sweeping outline crisp.`
  });
});

// POST Support Chat (rule-based concierge)
app.post("/api/support-chat", async (req, res) => {
  const { messages } = req.body;
  const lastUserMsg = messages?.[messages.length - 1]?.content || "";
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
});

export default app;
