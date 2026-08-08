import React, { useState, useEffect } from "react";
import {
  Scissors,
  Sparkles,
  Check,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  Heart,
  FileText,
  Send,
  Clock3,
  Paperclip,
  Music,
  Film,
  Trash2,
  UploadCloud,
  Lock,
  LogOut
} from "lucide-react";

import {
  CollectionItem,
  MeasurementProfile,
  CustomOrder,
  Appointment,
  InventoryItem,
  ChatMessage,
  OrderStatus,
  AppointmentType,
  Enquiry
} from "./types";
import { initialDb } from "./db";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "collections" | "bespoke" | "appointments" | "stylist" | "admin">("home");
  const [bespokeSubTab, setBespokeSubTab] = useState<"measure" | "customize" | "tracker">("measure");

  // Client State
  const [collections, setCollections] = useState<CollectionItem[]>(() => initialDb.collections || []);
  const [measurements, setMeasurements] = useState<MeasurementProfile[]>(() => initialDb.measurements || []);
  const [orders, setOrders] = useState<CustomOrder[]>(() => initialDb.orders || []);
  const [appointments, setAppointments] = useState<Appointment[]>(() => initialDb.appointments || []);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [logoFailed, setLogoFailed] = useState(false);

  // Selected product for appointment reservation from "Price on Request" click
  const [selectedProductForAppointment, setSelectedProductForAppointment] = useState<CollectionItem | null>(null);

  // Form States - Appointment attachments
  const [apptFile, setApptFile] = useState<{ name: string; size: number; type: string; base64: string } | null>(null);
  const [apptAudio, setApptAudio] = useState<{ name: string; size: number; type: string; base64: string } | null>(null);
  const [apptVideo, setApptVideo] = useState<{ name: string; size: number; type: string; base64: string } | null>(null);
  const [showContractsModal, setShowContractsModal] = useState(false);

  // Selected details
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  // Form States - Measurement
  const [measForm, setMeasForm] = useState({
    profileName: "My Bridal Fit",
    bust: 34.0,
    upperBust: 32.5,
    underBust: 30.0,
    waist: 26.0,
    hip: 37.5,
    shoulderWidth: 15.0,
    acrossChest: 13.0,
    backWidth: 13.5,
    sleeveLength: 21.5,
    armCircumference: 11.0,
    biceps: 10.0,
    wrist: 5.8,
    neck: 12.8,
    dressLength: 57.0,
    skirtLength: 39.0,
    blouseLength: 21.0,
    topLength: 23.0,
    trouserLength: 30.0,
    thigh: 21.5,
    knee: 13.5,
    ankle: 8.5,
    height: 64.0,
    heelHeightPref: 3.0,
    braCupSize: "34B"
  });

  // Form States - Custom Order
  const [orderForm, setOrderForm] = useState({
    category: "Bridal Gown",
    dressType: "Asymmetric Ball Gown",
    fabricPreference: "Akwa Ibom Chantilly Lace",
    colorPreference: "Champagne Ivory",
    sleeveStyle: "Regal Bishop Sleeves",
    neckline: "Sweetheart Illusion",
    silhouetteLength: "Floor Length with Cathedral Train",
    fitStyle: "Corseted (Laced-back)",
    liningPreference: "Silk Habotai Lining",
    closureType: "Invisible Zipper with Pearl Accent Buttons",
    embellishments: ["Austrian Crystals", "Hand-crafted lace appliques"],
    accessories: ["Cathedral veil"],
    specialInstructions: "",
    inspirationUrl: ""
  });

  // Form States - Appointment
  const [apptForm, setApptForm] = useState({
    type: "BRIDAL_CONSULTATION" as AppointmentType,
    date: "2026-07-10",
    time: "11:00",
    notes: ""
  });

  // Form States - AI Stylist
  const [stylistQuery, setStylistQuery] = useState({
    category: "Bridal Gown",
    fabric: "Akwa Ibom Chantilly Lace",
    color: "Champagne Gold",
    silhouette: "Asymmetric Ball Gown",
    occasion: "Luxury Wedding Reception",
    specialInstructions: ""
  });
  const [stylistResponse, setStylistResponse] = useState<string>("");
  const [stylistLoading, setStylistLoading] = useState(false);

  // Support Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content: "Prestige greetings. I am Esther, your personal luxury concierge at Airstar Fashion Home. How may I elevate your custom couture experience today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Marquee Direction State
  const [marqueeDirection, setMarqueeDirection] = useState<"left" | "right">("left");

  // Form States - Contact/Enquiry
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: "",
    customerEmail: "",
    subject: "Couture Design Inquiry",
    message: ""
  });

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminLoginEmail, setAdminLoginEmail] = useState("");
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = adminLoginEmail.trim().toLowerCase();
    
    if (!emailLower.endsWith("@gmail.com")) {
      setAdminLoginError("Access restricted. Please use a valid Gmail account (e.g. name@gmail.com).");
      return;
    }
    
    if (adminLoginPassword !== "1214") {
      setAdminLoginError("Invalid password. Please try again.");
      return;
    }
    
    setIsAdminLoggedIn(true);
    setAdminLoginError("");
  };

  const [adminOrders, setAdminOrders] = useState<CustomOrder[]>(() => initialDb.orders || []);
  const [adminAppointments, setAdminAppointments] = useState<Appointment[]>(() => initialDb.appointments || []);
  const [adminInventory, setAdminInventory] = useState<InventoryItem[]>(() => initialDb.inventory || []);
  const [adminEnquiries, setAdminEnquiries] = useState<Enquiry[]>(() => initialDb.enquiries || []);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<CustomOrder | null>(null);
  const [adminOrderNotes, setAdminOrderNotes] = useState("");
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  // Client alerts
  const [clientNotification, setClientNotification] = useState<string | null>(null);

  const fetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return fallback;
      return await res.json();
    } catch (err) {
      console.warn(`API unavailable for ${url}; using bundled data.`, err);
      return fallback;
    }
  };

  // Load all initial data from backend API. Seed data renders immediately,
  // then the live API response refreshes each section in parallel.
  const loadClientData = async () => {
    const [colData, measData, ordData, apptData, invData, enqData] = await Promise.all([
      fetchJson("/api/collections", initialDb.collections || []),
      fetchJson("/api/measurements", initialDb.measurements || []),
      fetchJson("/api/orders", initialDb.orders || []),
      fetchJson("/api/appointments", initialDb.appointments || []),
      fetchJson("/api/inventory", initialDb.inventory || []),
      fetchJson("/api/enquiries", initialDb.enquiries || [])
    ]);

    setCollections(colData);
    setMeasurements(measData);
    setOrders(ordData);
    setAdminOrders(ordData);
    if (ordData.length > 0 && !selectedOrder) {
      setSelectedOrder(ordData[0]);
    }
    setAppointments(apptData);
    setAdminAppointments(apptData);
    setAdminInventory(invData);
    setAdminEnquiries(enqData);
  };

  useEffect(() => {
    loadClientData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueeDirection((prev) => (prev === "left" ? "right" : "left"));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Quick helper to fetch and update admin inventory
  const refreshInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setAdminInventory(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Measurement Profile Submission
  const handleMeasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(measForm)
      });
      if (res.ok) {
        const data = await res.json();
        setMeasurements([...measurements, data]);
        setClientNotification("Your measurement profile has been logged securely to your Airstar portfolio.");
        setTimeout(() => setClientNotification(null), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Custom Order Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (measurements.length === 0) {
      alert("Please submit or select a measurement profile first so our drapers have your matching dimensions.");
      setBespokeSubTab("measure");
      return;
    }

    const payload = {
      customerName: "Mfon Akpabio",
      customerEmail: "mfonakpabio67@gmail.com",
      category: orderForm.category,
      dressType: orderForm.dressType,
      fabricPreference: orderForm.fabricPreference,
      colorPreference: orderForm.colorPreference,
      sleeveStyle: orderForm.sleeveStyle,
      neckline: orderForm.neckline,
      silhouetteLength: orderForm.silhouetteLength,
      fitStyle: orderForm.fitStyle,
      liningPreference: orderForm.liningPreference,
      closureType: orderForm.closureType,
      embellishments: orderForm.embellishments,
      accessories: orderForm.accessories,
      specialInstructions: orderForm.specialInstructions,
      inspirationImages: orderForm.inspirationUrl ? [orderForm.inspirationUrl] : [],
      totalAmount: orderForm.category.includes("Bridal") ? 1850000 : 450000,
      depositPaid: 0,
      measurementProfile: measurements[0] // Link to default profile
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setOrders([data, ...orders]);
        setSelectedOrder(data);
        setBespokeSubTab("tracker");
        setClientNotification("Airstar couture order created! View production progress in the tracking timeline.");
        setTimeout(() => setClientNotification(null), 5000);
        loadClientData(); // reload admin view
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Click handler for collections Price on Request
  const handlePriceOnRequestClick = (item: CollectionItem) => {
    setSelectedProductForAppointment(item);
    
    // Set form type depending on category
    const defaultType = item.category === "Bridal" ? "BRIDAL_CONSULTATION" : "CONSULTATION";
    
    setApptForm({
      type: defaultType,
      date: apptForm.date || "2026-07-10",
      time: apptForm.time || "11:00",
      notes: `Inquiry regarding the luxury garment: "${item.name}" (Silhouette: ${item.silhouette}, Fabrics: ${item.fabrics.join(", ")}). Please provide price info and styling details.`
    });

    // Reset attachments
    setApptFile(null);
    setApptAudio(null);
    setApptVideo(null);

    // Navigate to appointments tab
    setActiveTab("appointments");

    // Display a quick success notification
    setClientNotification(`"${item.name}" has been attached to your reservation form.`);
    setTimeout(() => setClientNotification(null), 4000);
  };

  // Appointment Booking Submission
  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startTimeIso = new Date(`${apptForm.date}T${apptForm.time}:00.000Z`).toISOString();
    // end appointment 1.5 hours later
    const endHour = parseInt(apptForm.time.split(":")[0]) + 1;
    const endMinutes = apptForm.time.split(":")[1];
    const endTimeIso = new Date(`${apptForm.date}T${String(endHour).padStart(2, "0")}:${endMinutes}:00.000Z`).toISOString();

    const payload = {
      customerName: "Mfon Akpabio",
      customerEmail: "mfonakpabio67@gmail.com",
      type: apptForm.type,
      startTime: startTimeIso,
      endTime: endTimeIso,
      notes: apptForm.notes,
      associatedProduct: selectedProductForAppointment || undefined,
      attachedFile: apptFile || undefined,
      attachedAudio: apptAudio || undefined,
      attachedVideo: apptVideo || undefined
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        const errData = await res.json();
        alert(errData.error);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setAppointments([data, ...appointments]);
        setClientNotification("Your fitting appointment request has been submitted. Status: PENDING Admin review.");
        
        // Reset states
        setSelectedProductForAppointment(null);
        setApptFile(null);
        setApptAudio(null);
        setApptVideo(null);
        setApptForm({
          type: "BRIDAL_CONSULTATION",
          date: "2026-07-10",
          time: "11:00",
          notes: ""
        });

        setTimeout(() => setClientNotification(null), 5000);
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client Enquiry Submission
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.customerName || !enquiryForm.customerEmail || !enquiryForm.message) {
      alert("Please provide your name, email address, and inquiry message so our studio desk can assist you.");
      return;
    }

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryForm)
      });

      if (res.ok) {
        setClientNotification("Your couture design inquiry has been submitted! Our admin team will review it shortly.");
        setEnquiryForm({
          customerName: "",
          customerEmail: "",
          subject: "Couture Design Inquiry",
          message: ""
        });
        setTimeout(() => setClientNotification(null), 5000);
        
        // Refresh enquiries dataset
        const enqRes = await fetch("/api/enquiries");
        const enqData = await enqRes.json();
        setAdminEnquiries(enqData);
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
    }
  };

  // Admin Enquiry Status Update
  const handleAdminEnquiryStatus = async (enqId: string, status: "PENDING" | "REVIEWED" | "ANSWERED") => {
    try {
      const res = await fetch(`/api/enquiries/${enqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setAdminNotification(`Inquiry status successfully updated to ${status}.`);
        setTimeout(() => setAdminNotification(null), 4000);
        
        // Refresh enquiries dataset
        const enqRes = await fetch("/api/enquiries");
        const enqData = await enqRes.json();
        setAdminEnquiries(enqData);
      }
    } catch (err) {
      console.error("Error updating inquiry status:", err);
    }
  };

  // AI Stylist Advice Generator
  const handleStylistGenerate = async () => {
    setStylistLoading(true);
    setStylistResponse("");
    try {
      const res = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stylistQuery)
      });
      const data = await res.json();
      setStylistResponse(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setStylistLoading(false);
    }
  };

  // Send message to Esther the Concierge Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: "ast-" + Date.now(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages([...newMsgs, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  // Admin Actions - Order Status change
  const handleAdminStatusChange = async (orderId: string, status: OrderStatus, progress: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          progressPercentage: progress,
          notes: adminOrderNotes || undefined
        })
      });
      if (res.ok) {
        setAdminNotification(`Order status shifted to ${status.replace(/_/g, " ")} successfully.`);
        setTimeout(() => setAdminNotification(null), 4000);
        setAdminOrderNotes("");
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Actions - Manage Appointment Statuses
  const handleAdminApptStatus = async (apptId: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAdminNotification(`Appointment marked as ${status} successfully.`);
        setTimeout(() => setAdminNotification(null), 4000);
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Actions - Manage Inventory levels
  const handleAdminInventoryChange = async (invId: string, newQty: number) => {
    try {
      const res = await fetch(`/api/inventory/${invId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        setAdminNotification("Inventory stock parameters adjusted.");
        setTimeout(() => setAdminNotification(null), 3000);
        refreshInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Favorites Toggle
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Quick Category Setup for Custom Order
  const triggerCustomDesignFromCollection = (category: string, fabrics: string[], silhouette: string) => {
    setOrderForm({
      ...orderForm,
      category: category + " Gown",
      fabricPreference: fabrics[0] || "Akwa Ibom Chantilly Lace",
      dressType: silhouette,
    });
    setActiveTab("bespoke");
    setBespokeSubTab("customize");
  };

  // Export reports to JSON as simple file logs
  const downloadReport = (type: string) => {
    const data = type === "orders" ? adminOrders : adminInventory;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `airstar_fashion_${type}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCollectionInitials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

  return (
    <div 
      className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "linear-gradient(rgba(12, 10, 9, 0.75), rgba(12, 10, 9, 0.75)), url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1600')" }}
    >
      
      {/* Frosted Glass Background Ambient Glows */}
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-900/10 via-transparent to-[#0c0a09]"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-rose-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* BRAND HEADER & NAVIGATION RAIL */}
      <header className="sticky top-0 z-50 bg-white/[0.02] backdrop-blur-md border-b border-white/5 px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-amber-400/40 bg-black/50 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-950/30">
            {!logoFailed ? (
              <img
                src="/assets/images/airstar-logo.jpg"
                alt="Airstar Logo"
                onError={() => setLogoFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[11px] font-serif tracking-[0.18em] text-amber-300">AFH</span>
            )}
          </div>
          <div>
            <h1 className="text-xl tracking-[0.25em] font-serif uppercase text-stone-50">
              Airstar <span className="text-amber-400 italic font-normal">Fashion Home</span>
            </h1>
            <p className="text-[10px] tracking-[0.1em] text-stone-400 font-mono">EXCLUSIVELY WOMEN'S COUTURE</p>
          </div>
        </div>

        {/* TOP NAV BAR */}
        <nav className="flex flex-wrap gap-1 sm:gap-2">
          {[
            { id: "home", label: "HOME" },
            { id: "collections", label: "COLLECTIONS" },
            { id: "bespoke", label: "AIRSTAR STUDIO" },
            { id: "appointments", label: "APPOINTMENTS" },
            { id: "stylist", label: "AI STYLIST & HELP" },
            { id: "admin", label: "ADMIN PORTAL" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs tracking-widest transition-all duration-300 font-medium border-b-2 rounded-none ${
                activeTab === tab.id
                  ? "text-amber-400 border-amber-400 bg-white/[0.05]"
                  : "text-stone-300 border-transparent hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* GLOBAL SYSTEM NOTIFICATION ALERTS */}
      {clientNotification && (
        <div className="bg-amber-400 text-stone-950 text-xs text-center py-2.5 px-4 font-semibold tracking-wide flex items-center justify-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-stone-950 shrink-0" />
          <span>{clientNotification}</span>
        </div>
      )}

      {/* CORE CONTENT SWITCHBOARD */}
      <main className="flex-1 pb-16">
        
        {/* TAB 1: LANDING HOME */}
        {activeTab === "home" && (
          <div className="space-y-20">
            {/* HERO MODULE */}
            <div className="relative w-full h-[90vh] overflow-hidden bg-stone-950 flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover opacity-85 select-none pointer-events-none"
              >
                <source
                  src="https://res.cloudinary.com/drrkjtu9v/video/upload/v1781619470/kling_20260615_Image_to_Video__6012_0_wwzgwd.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* Luxury dark radial layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-stone-950/70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0c0a09_85%)]" />

              <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-stone-100 flex flex-col items-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-tight leading-tight text-stone-100 text-shadow-sm">
                    Sovereignty & <span className="italic text-amber-200 font-normal">Grace</span>
                  </h2>

                  {/* Luxury Marquee strip for Sovereignty & Grace */}
                  <div className="w-full max-w-xl mx-auto bg-black/60 border-y border-amber-400/20 py-2.5 px-3 backdrop-blur-md overflow-hidden relative flex items-center">
                    <div className="animate-marquee whitespace-nowrap flex text-stone-300 font-serif flex-1">
                      <div className="flex shrink-0">
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Sovereignty & <span className="italic text-amber-200">Grace</span>
                        </span>
                        <span className="inline-block mx-8 text-xs text-amber-400 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Airstar Custom Couture
                        </span>
                        <span className="inline-block mx-8 text-xs text-stone-500 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Sovereignty & <span className="italic text-amber-200">Grace</span>
                        </span>
                        <span className="inline-block mx-8 text-xs text-amber-400 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Exquisite Anatomical Blueprints
                        </span>
                        <span className="inline-block mx-8 text-xs text-stone-500 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Sovereignty & <span className="italic text-amber-200">Grace</span>
                        </span>
                      </div>
                      <div className="flex shrink-0">
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Sovereignty & <span className="italic text-amber-200">Grace</span>
                        </span>
                        <span className="inline-block mx-8 text-xs text-amber-400 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Airstar Custom Couture
                        </span>
                        <span className="inline-block mx-8 text-xs text-stone-500 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Sovereignty & <span className="italic text-amber-200">Grace</span>
                        </span>
                        <span className="inline-block mx-8 text-xs text-amber-400 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Exquisite Anatomical Blueprints
                        </span>
                        <span className="inline-block mx-8 text-xs text-stone-500 font-mono">✦</span>
                        <span className="inline-block mx-8 text-sm font-serif tracking-wide text-stone-100">
                          Sovereignty & <span className="italic text-amber-200">Grace</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="max-w-lg mx-auto text-stone-200 text-sm sm:text-base font-light tracking-wide leading-relaxed bg-black/30 backdrop-blur-[2px] p-2.5">
                    Custom-crafted luxury gowns, bridal masterpieces, and tailored traditional couture designed exclusively for women of distinction.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
                  <button
                    onClick={() => {
                      setActiveTab("bespoke");
                      setBespokeSubTab("customize");
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold tracking-wider text-xs uppercase hover:brightness-110 transition-all rounded-none shadow-[0_4px_20px_rgba(245,158,11,0.2)] cursor-pointer"
                  >
                    Airstar Customizer
                  </button>
                  <button
                    onClick={() => setActiveTab("appointments")}
                    className="w-full sm:w-auto px-8 py-3.5 bg-stone-950/60 border border-stone-500 text-stone-200 hover:text-white hover:border-amber-400 font-medium tracking-wider text-xs uppercase transition-all rounded-none backdrop-blur-sm cursor-pointer"
                  >
                    Book Fitting Session
                  </button>
                </div>
              </div>

              {/* Decorative side margins */}
              <div className="absolute bottom-6 left-6 hidden lg:block text-stone-500 text-[10px] tracking-[0.2em] font-mono">
                ESTABLISHED 2025 // NIGERIA - COUTURE DESIGNS
              </div>
              <div className="absolute bottom-6 right-6 hidden lg:block text-stone-500 text-[10px] tracking-[0.2em] font-mono">
                ESTHERUDOISANG7@GMAIL.COM
              </div>
            </div>

            {/* ARTISAN BIOGRAPHY SECTION */}
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono block">
                  THE BRAND CREDO
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif text-stone-50 tracking-tight">
                  Uncompromising Dedication to the Feminine Line
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed font-light">
                  At Airstar Fashion Home, we believe women deserve clothing that does more than cover — it must crown. We celebrate the unique profiles of our clients with Airstar, high-precision tailoring using exclusive Akwa Ibom laces, raw silks, royal brocades, and heavy satin.
                </p>
                <div className="border-l-2 border-amber-400/50 pl-4 py-1 text-stone-400 italic text-xs leading-relaxed">
                  "We specialize strictly in premium women's couture. Every pattern is custom-drafted, every embellishment stitched by hand, ensuring that no two dresses are ever identical."
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("collections")}
                    className="flex items-center gap-2 text-xs tracking-wider text-amber-400 uppercase font-semibold hover:translate-x-1 transition-transform"
                  >
                    <span>Browse High-End Portfolio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-2 border border-amber-400/20 pointer-events-none" />
                <img
                  src="/assets/images/ibom_premium_peplum_suit_home.jpeg"
                  alt="Ibom Premium Peplum Suit Set"
                  className="w-full transition-all duration-700 shadow-2xl hover:scale-[1.02] border border-white/10"
                />
              </div>
            </div>

            {/* WHAT WE DESIGN FEATURE SHELF */}
            <div className="bg-white/[0.02] backdrop-blur-md border-y border-white/5 py-20 px-6">
              <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-400 block font-mono">
                  OUR REPERTOIRE
                </span>
                <h3 className="text-3xl font-serif text-stone-100">Exquisite Sartorial Focus</h3>
                <p className="text-stone-400 text-xs max-w-md mx-auto">
                  We specialize in crafting dresses of unmatched elegance for premium occassions.
                </p>
              </div>

              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Bridal Gowns & Reception",
                    desc: "Handcrafted white ivory tulle, Akwa Ibom laces, structured boning, and majestic sweeping trains.",
                    tag: "BRIDAL"
                  },
                  {
                    title: "Nigerian Traditional & Akwa Ibom",
                    desc: "Stunning cultural attire, beaded wrapper sets, custom Geles, and handcrafted coral capes styled precisely for traditional royalty.",
                    tag: "REGAL TRADITION"
                  },
                  {
                    title: "Evening & Gala Gowns",
                    desc: "Asymmetric necklines, open-back cocktail gowns, and flowing silks designed for presence under studio lights.",
                    tag: "EVENING COUTURE"
                  },
                  {
                    title: "Corporate Couture",
                    desc: "Architecturally padded power suit-jackets and pencil set sheath cuts using Italian worsted wools.",
                    tag: "OFFICE LUXURY"
                  },
                  {
                    title: "Ready-to-Wear Boubous",
                    desc: "Voluminous silk Boubous, airy Kaftans, and matching two-pieces requiring no fitted measurements.",
                    tag: "ELEGANT EASE"
                  },
                  {
                    title: "Milestone Gowns",
                    desc: "Airstar creations for graduation milestones, birthday celebrations, and engagement portraits.",
                    tag: "CELEBRATIONS"
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-8 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <span className="text-[10px] tracking-widest font-mono text-amber-400 font-semibold uppercase">
                        {item.tag}
                      </span>
                      <h4 className="text-lg font-serif text-stone-100 font-medium">{item.title}</h4>
                      <p className="text-xs text-stone-400 leading-relaxed font-light">{item.desc}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                      <button
                        onClick={() => triggerCustomDesignFromCollection(item.title, [], "Asymmetric")}
                        className="text-[10px] text-amber-400 tracking-wider uppercase font-semibold hover:underline"
                      >
                        Design This Style
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TESTIMONIAL PANEL */}
            <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono block">
                AIRSTAR REVIEWS
              </span>
              <h3 className="text-3xl font-serif text-stone-100">Voices of Our Sovereigns</h3>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 sm:p-12 space-y-6">
                <p className="text-lg font-serif text-stone-200 italic leading-relaxed">
                  "Esther and her master tailors at Airstar designed my reception gown and three Aso Ebi outfits for my bridesmaids. The structural boning fit me like a second glove! Their dedication to precision was absolutely remarkable."
                </p>
                <div>
                  <h4 className="text-sm font-semibold text-stone-100 tracking-wider">Princess Kemi Adegoke</h4>
                  <p className="text-[10px] font-mono text-stone-500 uppercase mt-0.5">LAGOS WEDDING CLIENT</p>
                </div>
              </div>
            </div>

            {/* FREQUENTLY ASKED QUESTIONS SECTION */}
            <div className="max-w-4xl mx-auto px-6 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-400 block font-mono">FAQs</span>
                <h3 className="text-2xl font-serif text-stone-100">Airstar Consultations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    q: "How many fittings are required for bridal gowns?",
                    a: "We recommend a minimum of three fitting windows: first mockup structural shell fitting, second lining contour fitting, and final dress drop length checks."
                  },
                  {
                    q: "What is your typical production timeframe?",
                    a: "Standard ready-to-wear designs take 1-2 weeks. Custom couture and elaborate wedding gowns require 4-8 weeks from paper drafts to packaging."
                  },
                  {
                    q: "Can I supply my own lace and silk materials?",
                    a: "Absolutely. You can request 'Tailor Only' during custom order builder and record fabrics, or let us provide our imported premium drapes."
                  },
                  {
                    q: "Do you specialize in men's apparel?",
                    a: "No. Airstar specializes exclusively in high-end women's fashion to focus 100% of our drapers' expertise on women's patterns."
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="p-6 bg-white/[0.03] backdrop-blur-sm border border-white/5 space-y-2">
                    <h4 className="text-sm font-semibold text-amber-400 tracking-wide font-serif">{faq.q}</h4>
                    <p className="text-xs text-stone-400 leading-relaxed font-light">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* COUTURE INQUIRY DESK */}
            <div className="max-w-xl mx-auto px-6 space-y-6 pt-12 border-t border-stone-900">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-400 block font-mono">DIRECT INQUIRIES</span>
                <h3 className="text-2xl font-serif text-stone-100">AIRSTAR DESK</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed font-light">
                  Have a specific question about custom sizing, fabrics availability, or traditional bridal bundles? Send us a direct inquiry.
                </p>
              </div>

              <form onSubmit={handleEnquirySubmit} className="space-y-4 bg-white/5 border border-white/10 p-6 shadow-xl">
                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider font-mono">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.customerName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, customerName: e.target.value })}
                    placeholder="e.g. Chioma Bello"
                    className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      required
                      value={enquiryForm.customerEmail}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, customerEmail: e.target.value })}
                      placeholder="e.g. chioma@gmail.com"
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider font-mono">Inquiry Subject</label>
                    <select
                      value={enquiryForm.subject}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, subject: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none cursor-pointer font-sans"
                    >
                      <option value="Couture Design Inquiry">Couture Design Inquiry</option>
                      <option value="Bridal Pack Rates">Bridal Pack Rates</option>
                      <option value="Fabric Customization">Fabric Customization</option>
                      <option value="Traditional Aso Ebi Bulk">Traditional Aso Ebi Bulk</option>
                      <option value="Measurement Updates">Measurement Updates</option>
                      <option value="Other Sizing/Styling">Other Sizing/Styling</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider font-mono">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Describe your design specifications, requested fittings timeframe, or other custom drapes questions..."
                    className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none resize-none font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-none hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  Send Inquiry to Airstar Desk
                </button>
              </form>
            </div>

            {/* FOOTER & BRANDS */}
            <footer className="border-t border-stone-900 bg-stone-950 py-12 px-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-stone-900 pb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-amber-400/40 bg-black/50 flex items-center justify-center overflow-hidden">
                      {!logoFailed ? (
                        <img
                          src="/assets/images/airstar-logo.jpg"
                          alt="Airstar Logo"
                          onError={() => setLogoFailed(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-serif tracking-[0.16em] text-amber-300">AFH</span>
                      )}
                    </div>
                    <h4 className="text-base font-serif tracking-wider uppercase text-stone-200">
                      Airstar Fashion Home
                    </h4>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    Providing custom luxury gowns and tailoring blueprints since 2025. Crafting elegant traditional attire and modern power sets. @Nung uyo,idoro, Akwa ibom state
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold tracking-widest text-amber-400 uppercase font-mono">
                    Airstar Working Hours
                  </h4>
                  <ul className="text-xs text-stone-300 space-y-2">
                    <li>Monday - Friday: 09:00 AM - 06:00 PM</li>
                    <li>Saturday: 10:00 AM - 04:00 PM</li>
                    <li>Sunday: Closed (Private Fittings Only)</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold tracking-widest text-amber-400 uppercase font-mono">
                    Secure Sinks & Contact
                  </h4>
                  <ul className="text-xs text-stone-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>estherudoisang7@gmail.com</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>+234 81 2345 6789 (WhatsApp ready)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="max-w-6xl mx-auto pt-6 flex flex-col md:flex-row justify-between items-center text-stone-500 text-[10px] tracking-wider font-mono gap-4">
                <span>© 2026 AIRSTAR FASHION HOME. ALL RIGHTS RESERVED. EXCLUSIVELY FEMININE DESIGNS.</span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span 
                    onClick={() => setShowContractsModal(true)} 
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    PRIVACY & COUTURE CONTRACTS
                  </span>
                  <span className="text-stone-400 text-[10px] tracking-[0.15em]">POWERED BY MFON AKPABIO</span>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* TAB 2: PORTFOLIO COLLECTIONS */}
        {activeTab === "collections" && (
          <div className="max-w-6xl mx-auto px-6 pt-10 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono block">
                CURATED AIRSTAR GALLERY
              </span>
              <h2 className="text-3xl font-serif tracking-tight text-stone-100">Airstar Design Swatches</h2>
              <p className="text-xs text-stone-400 max-w-md mx-auto font-light leading-relaxed">
                Explore our signature lines. Each gown serves as a blueprint which our tailors can recreate according to your custom measurement profile.
              </p>
            </div>

            {/* COLLECTION GALLERY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
                >
                  <div className="relative overflow-hidden aspect-[4/5] bg-stone-950">
                    <div className="absolute inset-0 bg-stone-950 flex items-center justify-center">
                      <div className={`absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 animate-pulse transition-opacity duration-700 ${loadedImages[item.id] ? "opacity-0" : "opacity-100"}`} />
                      {!failedImages[item.id] ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          onLoad={() => setLoadedImages(prev => ({ ...prev, [item.id]: true }))}
                          onError={() => {
                            setFailedImages(prev => ({ ...prev, [item.id]: true }));
                            setLoadedImages(prev => ({ ...prev, [item.id]: true }));
                          }}
                          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${loadedImages[item.id] ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${(item.id === "col-7" || item.id === "col-8" || item.id === "col-9") ? "object-top" : "object-center"}`}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_38%),linear-gradient(135deg,rgba(28,25,23,0.98),rgba(12,10,9,0.95))]">
                          <div className="w-24 h-24 rounded-full border border-amber-400/40 bg-black/30 flex items-center justify-center mb-6 shadow-xl shadow-black/30">
                            <span className="text-3xl font-serif tracking-[0.18em] text-amber-300">
                              {getCollectionInitials(item.name)}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-400 font-mono mb-3">
                            Airstar Couture
                          </span>
                          <span className="text-lg font-serif text-stone-100 leading-tight">
                            {item.name}
                          </span>
                          <span className="mt-4 h-px w-20 bg-amber-400/40" />
                        </div>
                      )}
                    </div>
                    {item.category !== "Evening Wear" && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] tracking-widest uppercase text-stone-300 px-2.5 py-1 font-mono">
                        {item.category}
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm border border-white/10 text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          favorites.includes(item.id) ? "fill-red-400 text-red-400" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-serif text-stone-200 leading-tight">{item.name}</h3>
                      <button
                        onClick={() => handlePriceOnRequestClick(item)}
                        className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 hover:bg-amber-500/20 hover:text-amber-300 transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap font-semibold"
                        id={`req-price-${item.id}`}
                        title="Click to reserve consultation & request pricing details"
                      >
                        Price on Request
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed font-light h-16 overflow-hidden line-clamp-3">
                      {item.description}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-mono">
                        Silhouettes / Fabrics
                      </span>
                      <p className="text-[11px] text-stone-300 font-mono">
                        {item.silhouette} · {item.fabrics.join(", ")}
                      </p>
                    </div>

                    <button
                      onClick={() => triggerCustomDesignFromCollection(item.category, item.fabrics, item.silhouette)}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:text-white hover:bg-amber-500 hover:border-amber-500 transition-all text-xs tracking-wider uppercase font-semibold"
                    >
                      Design Custom Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AIRSTAR STUDIO */}
        {activeTab === "bespoke" && (
          <div className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
            
            {/* SUBTABS */}
            <div className="flex border-b border-white/5 justify-center gap-2">
              {[
                { id: "measure", label: "MEASUREMENT REGISTRY" },
                { id: "customize", label: "AIRSTAR CUSTOMIZER" },
                { id: "tracker", label: "PRODUCTION TIMELINE" }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setBespokeSubTab(sub.id as any)}
                  className={`px-4 py-3 text-xs tracking-wider transition-all rounded-none border-b-2 ${
                    bespokeSubTab === sub.id
                      ? "text-amber-400 border-amber-400 bg-white/[0.05]"
                      : "text-stone-400 border-transparent hover:text-stone-200"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* SUBTAB CONTENT 1: MEASUREMENT SYSTEM */}
            {bespokeSubTab === "measure" && (
              <div className="space-y-8 bg-white/5 backdrop-blur-md border border-white/10 p-8">
                <div className="border-b border-white/5 pb-6">
                  <h3 className="text-xl font-serif text-stone-200">Sizing Matrix Registry</h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Log your precise physical metrics in inches. Sizing matrices are logged to your Airstar file so our pattern drapers can block-draft templates flawlessly.
                  </p>
                </div>

                <form onSubmit={handleMeasSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-amber-400 mb-2 font-semibold">
                        Fit Label / Title
                      </label>
                      <input
                        type="text"
                        value={measForm.profileName}
                        onChange={(e) => setMeasForm({ ...measForm, profileName: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-amber-400 mb-2 font-semibold">
                        Bra Cup Size (e.g. 34C, 36D)
                      </label>
                      <input
                        type="text"
                        value={measForm.braCupSize}
                        onChange={(e) => setMeasForm({ ...measForm, braCupSize: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs uppercase tracking-widest text-amber-400/80 border-b border-white/5 pb-2 font-mono">
                      Body Metrics Grid (Inches)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[
                        { id: "bust", label: "Bust Line" },
                        { id: "upperBust", label: "Upper Bust" },
                        { id: "underBust", label: "Under Bust" },
                        { id: "waist", label: "Waist Line" },
                        { id: "hip", label: "Hip (Widest)" },
                        { id: "shoulderWidth", label: "Shoulder width" },
                        { id: "acrossChest", label: "Across Chest" },
                        { id: "backWidth", label: "Back Width" },
                        { id: "sleeveLength", label: "Sleeve Length" },
                        { id: "armCircumference", label: "Arm Hole" },
                        { id: "biceps", label: "Biceps" },
                        { id: "wrist", label: "Wrist circumference" },
                        { id: "neck", label: "Neck block" },
                        { id: "dressLength", label: "Dress Length" },
                        { id: "skirtLength", label: "Skirt length" },
                        { id: "blouseLength", label: "Blouse length" },
                        { id: "topLength", label: "Top length" },
                        { id: "trouserLength", label: "Trouser Inseam" },
                        { id: "thigh", label: "Thigh" },
                        { id: "knee", label: "Knee line" },
                        { id: "ankle", label: "Ankle line" },
                        { id: "height", label: "Full Height" },
                        { id: "heelHeightPref", label: "Heel Preference" }
                      ].map((item) => (
                        <div key={item.id} className="flex flex-col">
                          <label className="text-xs text-stone-300 mb-1 font-mono">{item.label}</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={(measForm as any)[item.id]}
                              onChange={(e) =>
                                setMeasForm({ ...measForm, [item.id]: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full bg-black/40 border border-white/10 pl-3 pr-8 py-2 text-stone-200 focus:outline-none focus:border-amber-400 text-xs transition-colors rounded-none font-mono text-right"
                              required
                            />
                            <span className="absolute right-3 top-2.5 text-[9px] text-stone-500 font-mono">IN</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="text-xs text-stone-400 font-light max-w-sm">
                      Sizing metrics can be reused or adjusted anytime by calling our master tailors.
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 transition-all rounded-none shadow-md"
                    >
                      Log Fit Configuration
                    </button>
                  </div>
                </form>

                {measurements.length > 0 && (
                  <div className="border-t border-white/5 pt-8">
                    <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-4 font-semibold font-mono">
                      Saved Signature Fits ({measurements.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {measurements.map((m) => (
                        <div key={m.id} className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-none flex justify-between items-center">
                          <div>
                            <span className="text-xs text-amber-400 uppercase tracking-wider font-mono font-bold block">
                              {m.profileName}
                            </span>
                            <span className="text-[10px] text-stone-400 block mt-1 font-mono">
                              Bust: {m.bust}" · Waist: {m.waist}" · Hip: {m.hip}" · Height: {m.height}"
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">Saved ID: {m.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB CONTENT 2: COUTURE BUILDER CUSTOMIZER */}
            {bespokeSubTab === "customize" && (
              <div className="space-y-8 bg-white/5 backdrop-blur-md border border-white/10 p-8">
                <div className="border-b border-white/5 pb-6">
                  <h3 className="text-xl font-serif text-stone-200">Airstar Couture Builder</h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Build an Airstar design block step-by-step. Let our master tailors combine your silhouette selection with saved fit matrices.
                  </p>
                </div>

                <form onSubmit={handleOrderSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Dress Category
                      </label>
                      <select
                        value={orderForm.category}
                        onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none cursor-pointer"
                      >
                        <option value="Bridal Gown">Bridal Gown</option>
                        <option value="Reception Dress">Reception Dress</option>
                        <option value="Evening Gown">Evening Gown</option>
                        <option value="Dinner Dress">Dinner Dress</option>
                        <option value="Traditional Attire / Aso Ebi">Traditional Attire / Aso Ebi</option>
                        <option value="Corporate Dress Set">Corporate Dress Set</option>
                        <option value="Boubou / Kaftan">Boubou / Kaftan</option>
                        <option value="Luxury Couture Custom">Luxury Couture Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Silhouette & Cut Style
                      </label>
                      <input
                        type="text"
                        value={orderForm.dressType}
                        onChange={(e) => setOrderForm({ ...orderForm, dressType: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none"
                        placeholder="e.g. Asymmetric Trumpet Slit"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Fabric Preference
                      </label>
                      <select
                        value={orderForm.fabricPreference}
                        onChange={(e) => setOrderForm({ ...orderForm, fabricPreference: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none cursor-pointer"
                      >
                        <option value="Akwa Ibom Chantilly Lace">Akwa Ibom Chantilly Lace</option>
                        <option value="Heavyweight Silk Mikado">Heavyweight Silk Mikado</option>
                        <option value="Regal Brocade">Regal Brocade</option>
                        <option value="Duchess Satin">Duchess Satin</option>
                        <option value="Handwoven Aso Oke">Handwoven Aso Oke</option>
                        <option value="Fluid Silk Crepe">Fluid Silk Crepe</option>
                        <option value="Premium Velvet">Premium Velvet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Color Tone Specification
                      </label>
                      <input
                        type="text"
                        value={orderForm.colorPreference}
                        onChange={(e) => setOrderForm({ ...orderForm, colorPreference: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none"
                        placeholder="e.g. Soft Pink with Champagne Lace"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Sleeve Style
                      </label>
                      <select
                        value={orderForm.sleeveStyle}
                        onChange={(e) => setOrderForm({ ...orderForm, sleeveStyle: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none cursor-pointer"
                      >
                        <option value="Sleeveless / Off-Shoulder">Sleeveless / Off-Shoulder</option>
                        <option value="Regal Bishop Sleeves">Regal Bishop Sleeves</option>
                        <option value="Elegant Cape Sleeves">Elegant Cape Sleeves</option>
                        <option value="Structured Puff sleeves">Structured Puff sleeves</option>
                        <option value="Peplum Fitted Sleeves">Peplum Fitted Sleeves</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Neckline Architecture
                      </label>
                      <select
                        value={orderForm.neckline}
                        onChange={(e) => setOrderForm({ ...orderForm, neckline: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none cursor-pointer"
                      >
                        <option value="Sweetheart Illusion">Sweetheart Illusion</option>
                        <option value="High Collar Regal">High Collar Regal</option>
                        <option value="Sculpted Deep V-Neck">Sculpted Deep V-Neck</option>
                        <option value="Asymmetric Draped plunge">Asymmetric Draped plunge</option>
                        <option value="Queen Anne Neckline">Queen Anne Neckline</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Silhouette Length
                      </label>
                      <input
                        type="text"
                        value={orderForm.silhouetteLength}
                        onChange={(e) => setOrderForm({ ...orderForm, silhouetteLength: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none"
                        placeholder="e.g. Floor Length with Cathedral Train"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Closure System Type
                      </label>
                      <input
                        type="text"
                        value={orderForm.closureType}
                        onChange={(e) => setOrderForm({ ...orderForm, closureType: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none"
                        placeholder="e.g. Corseted lace-back + invisible zip"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Lining Style Preference
                      </label>
                      <input
                        type="text"
                        value={orderForm.liningPreference}
                        onChange={(e) => setOrderForm({ ...orderForm, liningPreference: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none"
                        placeholder="e.g. Silk Habotai double-lining"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                        Inspiration Photo URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={orderForm.inspirationUrl}
                        onChange={(e) => setOrderForm({ ...orderForm, inspirationUrl: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none font-mono"
                        placeholder="Paste image URL (e.g. Unsplash or Cloudinary)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-stone-400 mb-2 tracking-wider">
                      Special Design Directives
                    </label>
                    <textarea
                      value={orderForm.specialInstructions}
                      onChange={(e) => setOrderForm({ ...orderForm, specialInstructions: e.target.value })}
                      className="w-full h-32 bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-amber-400 rounded-none resize-none"
                      placeholder="Add specific embroidery directions, seam allowances, mesh tone preferences, or alterations needs..."
                    />
                  </div>

                  {measurements.length === 0 ? (
                    <div className="p-4 bg-amber-400/10 border border-amber-400/40 text-amber-200 text-xs tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Please register or define a <strong>Sizing Matrix Profile</strong> first. We require measurement parameters to compute draper specifications.</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 text-stone-400 text-xs font-mono">
                      Active Sizing Block: <strong className="text-amber-400">{measurements[0]?.profileName}</strong> ({measurements[0]?.bust}" x {measurements[0]?.waist}" x {measurements[0]?.hip}")
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all rounded-none shadow-md"
                    >
                      Initiate Custom Order Build
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUBTAB CONTENT 3: ORDER TIMELINE TRACKER */}
            {bespokeSubTab === "tracker" && (
              <div className="space-y-8 bg-white/5 backdrop-blur-md border border-white/10 p-8">
                <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-serif text-stone-200">Active Production Tracking</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Check real-time studio drafting, cutting, and assembly timelines for your custom order.
                    </p>
                  </div>
                  {orders.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">Switch order:</span>
                      <select
                        value={selectedOrder?.id || ""}
                        onChange={(e) => {
                          const matched = orders.find((o) => o.id === e.target.value);
                          if (matched) setSelectedOrder(matched);
                        }}
                        className="bg-black/40 border border-white/10 text-xs px-3 py-1.5 text-amber-400 focus:outline-none"
                      >
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>{o.orderNumber} - {o.dressType}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <Scissors className="w-10 h-10 text-stone-600 mx-auto" />
                    <p className="text-stone-400 text-xs font-light">No custom couture orders logged to this file yet.</p>
                    <button
                      onClick={() => setBespokeSubTab("customize")}
                      className="px-6 py-2.5 bg-amber-500 text-stone-950 text-xs font-semibold uppercase hover:brightness-105"
                    >
                      Configure Couture Order
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* ORDER BRIEF INFO CARD */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="p-6 bg-white/[0.03] backdrop-blur-sm border border-white/5 space-y-4">
                        <span className="text-[9px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-none font-mono font-bold tracking-widest uppercase">
                          {(selectedOrder?.status || "").replace(/_/g, " ")}
                        </span>
                        <h4 className="text-lg font-serif text-stone-200 mt-1">{selectedOrder?.dressType}</h4>
                        <div className="text-xs text-stone-400 font-mono space-y-2 pt-2 border-t border-white/5">
                          <div><span className="text-stone-500">REF:</span> {selectedOrder?.orderNumber}</div>
                          <div><span className="text-stone-500">FABRIC:</span> {selectedOrder?.fabricPreference}</div>
                          <div><span className="text-stone-500">COLOR:</span> {selectedOrder?.colorPreference}</div>
                          <div><span className="text-stone-500">LENGTH:</span> {selectedOrder?.silhouetteLength}</div>
                          <div><span className="text-stone-500">NECK:</span> {selectedOrder?.neckline}</div>
                          <div><span className="text-stone-500">SLEEVES:</span> {selectedOrder?.sleeveStyle}</div>
                          <div><span className="text-stone-500">DATE PLACED:</span> {new Date(selectedOrder?.createdAt || "").toLocaleDateString()}</div>
                        </div>

                        {selectedOrder?.inspirationImages && selectedOrder.inspirationImages.length > 0 && (
                          <div className="pt-4 border-t border-white/5 space-y-2">
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-mono">Inspiration image:</span>
<img src={selectedOrder.inspirationImages[0]} alt="Inspiration" className="w-full h-32 object-contain border border-white/5 bg-black/10" />
                          </div>
                        )}
                      </div>

                      {/* SIMULATED PAYMENTS */}
                      <div className="p-6 bg-white/[0.03] backdrop-blur-sm border border-amber-500/10 space-y-4">
                        <h5 className="text-xs font-semibold uppercase tracking-widest text-amber-400 font-mono">
                          Payment Portal Casing
                        </h5>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-stone-400">Total Valuation:</span>
                          <span className="text-base font-semibold text-stone-200 font-mono">₦{selectedOrder?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-stone-400">Paid Deposit:</span>
                          <span className="text-sm text-stone-300 font-mono">₦{selectedOrder?.depositPaid?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-2 text-amber-200 font-semibold text-xs">
                          <span>Balance:</span>
                          <span className="font-mono">₦{((selectedOrder?.totalAmount || 0) - (selectedOrder?.depositPaid || 0))?.toLocaleString()}</span>
                        </div>

                        {(selectedOrder?.depositPaid || 0) < (selectedOrder?.totalAmount || 0) ? (
                          <div className="space-y-2 pt-2">
                            <button
                              onClick={() => {
                                if (!selectedOrder) return;
                                const updated = { ...selectedOrder, depositPaid: selectedOrder.totalAmount };
                                setSelectedOrder(updated);
                                setOrders(orders.map((o) => o.id === updated.id ? updated : o));
                                alert("Simulated Paystack/Stripe checkout transaction approved! Receipt downloaded.");
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-none hover:brightness-110 transition-all"
                            >
                              Stripe Checkout Payment
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedOrder) return;
                                const updated = { ...selectedOrder, depositPaid: selectedOrder.totalAmount };
                                setSelectedOrder(updated);
                                setOrders(orders.map((o) => o.id === updated.id ? updated : o));
                                alert("Simulated Paystack checkout transaction approved!");
                              }}
                              className="w-full py-2.5 bg-white/10 border border-white/10 text-stone-200 font-semibold text-xs uppercase tracking-wider rounded-none hover:bg-white/20 transition-all"
                            >
                              Paystack Secure pay
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[10px] uppercase tracking-wider text-center font-bold font-mono">
                            VALUATION FULLY COMPENSATED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VERTICAL PRODUCTION TIMELINE GRAPH */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 bg-white/[0.03] backdrop-blur-sm border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-xs uppercase tracking-wider font-bold text-stone-300">STAGE LOGS</span>
                          <span className="text-xs font-mono text-amber-400">Completion: {selectedOrder?.progressPercentage}%</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-black/40 overflow-hidden mb-8 border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                            style={{ width: `${selectedOrder?.progressPercentage}%` }}
                          />
                        </div>

                        {/* Workflow stages list */}
                        <div className="relative pl-6 border-l border-white/5 space-y-6">
                          {[
                            { status: "ORDER_RECEIVED", label: "Order Received", desc: "Configuration submitted and verified by system." },
                            { status: "DESIGN_REVIEW", label: "Design Review", desc: "Design flat blueprints verified by our lead draper." },
                            { status: "FABRIC_SELECTION", label: "Fabric Sourcing", desc: "Fabrics pulled and checked for grain line density." },
                            { status: "PATTERN_DRAFTING", label: "Pattern Drafting", desc: "Drafting paper pattern slopers with your measurement block." },
                            { status: "CUTTING", label: "Cutting Stage", desc: "Couture materials precision sheared." },
                            { status: "SEWING", label: "Sewing Room", desc: "Main panel assembly with premium threads." },
                            { status: "FIRST_FITTING", label: "First Fitting Block", desc: "Fittings alignment to establish hem drop lines." },
                            { status: "ALTERATIONS", label: "Refining Seams", desc: "Re-pinning and adjustments." },
                            { status: "QUALITY_INSPECTION", label: "Inspection Room", desc: "Ensuring flawless stitching, zippers, and lace appliques." },
                            { status: "PACKAGING", label: "Preservation Casing", desc: "Hand-wrapped in luxury acid-free tissue boxes." },
                            { status: "READY_FOR_PICKUP", label: "Awaiting Collection", desc: "Ready for private client collect window." },
                            { status: "DELIVERED", label: "Delivered", desc: "Couture received. Style file closed." }
                          ].map((stage, sIdx) => {
                            const dbPhases = [
                              "ORDER_RECEIVED",
                              "DESIGN_REVIEW",
                              "FABRIC_SELECTION",
                              "PATTERN_DRAFTING",
                              "CUTTING",
                              "SEWING",
                              "FIRST_FITTING",
                              "ALTERATIONS",
                              "QUALITY_INSPECTION",
                              "PACKAGING",
                              "READY_FOR_PICKUP",
                              "DELIVERED"
                            ];
                            const currentIdx = dbPhases.indexOf(selectedOrder?.status || "ORDER_RECEIVED");
                            const isPast = sIdx < currentIdx;
                            const isCurrent = sIdx === currentIdx;

                            return (
                              <div key={stage.status} className="relative flex flex-col">
                                <div
                                  className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 bg-black flex items-center justify-center transition-all ${
                                    isPast
                                      ? "border-amber-400 bg-amber-400 text-stone-950"
                                      : isCurrent
                                      ? "border-amber-400 animate-pulse bg-black"
                                      : "border-white/10"
                                  }`}
                                >
                                  {isPast && <Check className="w-2.5 h-2.5 text-stone-950" />}
                                </div>
                                <div className="pl-2">
                                  <span
                                    className={`text-xs font-semibold tracking-wider transition-colors ${
                                      isCurrent ? "text-amber-400" : isPast ? "text-stone-300" : "text-stone-600"
                                    }`}
                                  >
                                    {stage.label}
                                  </span>
                                  <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5 font-light">
                                    {stage.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="max-w-4xl mx-auto px-6 pt-10 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono block">
                PRIVATE RESERVATIONS
              </span>
              <h2 className="text-3xl font-serif tracking-tight text-stone-100">Airstar Consultations</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto font-light leading-relaxed">
                Schedule a private block inside our design parlor. Our system enforces conflict checks to ensure exclusive space for every sovereign.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              
              {/* BOOKING FORM */}
              <div className="lg:col-span-3 bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
                <h3 className="text-sm uppercase tracking-widest text-amber-400 font-semibold border-b border-white/5 pb-3 font-mono">
                  Reserve a Design Slot
                </h3>

                {selectedProductForAppointment && (
                  <div className="bg-amber-500/[0.04] border border-amber-500/20 p-4 flex gap-4 items-center">
                    <img
                      src={selectedProductForAppointment.image}
                      alt={selectedProductForAppointment.name}
                      className="w-16 h-20 object-cover border border-white/10"
                    />
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-mono font-semibold block">
                        Gown Inquiry Attached
                      </span>
                      <h4 className="text-xs font-serif text-stone-200 font-medium truncate">
                        {selectedProductForAppointment.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono truncate">
                        {selectedProductForAppointment.silhouette} · {selectedProductForAppointment.fabrics.join(", ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductForAppointment(null);
                        setApptForm({ ...apptForm, notes: "" });
                      }}
                      className="text-stone-400 hover:text-red-400 text-[10px] font-mono uppercase tracking-wider underline shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <form onSubmit={handleApptSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase text-stone-400 mb-2">Reservation Type</label>
                    <select
                      value={apptForm.type}
                      onChange={(e) => setApptForm({ ...apptForm, type: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none cursor-pointer"
                    >
                      <option value="BRIDAL_CONSULTATION">Bridal Consultation (Veil matching & sketch drafts)</option>
                      <option value="CONSULTATION">Airstar Consultation (Styling guidance)</option>
                      <option value="MEASUREMENT_SESSION">Measurement Sizing Session</option>
                      <option value="FITTING_SESSION">First Mock Fitting Session</option>
                      <option value="ALTERATION_APPOINTMENT">Alterations & seam pins review</option>
                      <option value="PICKUP_APPOINTMENT">Couture Pickup Appointment</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2">Target Date</label>
                      <input
                        type="date"
                        value={apptForm.date}
                        onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-stone-400 mb-2">Select Time</label>
                      <select
                        value={apptForm.time}
                        onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none font-mono cursor-pointer"
                      >
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-stone-400 mb-2">Special Fitting Request Notes</label>
                    <textarea
                      value={apptForm.notes}
                      onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                      className="w-full h-24 bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none resize-none"
                      placeholder="e.g. Discussing train loops or veil length details..."
                    />
                  </div>

                  {/* ATTACHMENTS SECTION */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <span className="text-[10px] uppercase text-amber-400 font-mono tracking-widest font-semibold block">
                      Consultation Attachments (Optional)
                    </span>
                    <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                      Upload reference sketches, voice guides, or fitting clips from your device. You can drag and drop files or click to browse.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* FILE UPLOAD */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            const base64 = await fileToBase64(file);
                            setApptFile({ name: file.name, size: file.size, type: file.type, base64 });
                          }
                        }}
                        className={`border border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[110px] ${
                          apptFile ? "border-amber-500/50 bg-amber-500/[0.02]" : "border-white/10 hover:border-amber-400/40 bg-black/20"
                        }`}
                        onClick={() => document.getElementById("file-device")?.click()}
                      >
                        <input
                          id="file-device"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const base64 = await fileToBase64(file);
                              setApptFile({ name: file.name, size: file.size, type: file.type, base64 });
                            }
                          }}
                        />
                        {apptFile ? (
                          <div className="space-y-1 w-full">
                            <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                            <p className="text-[10px] text-stone-200 font-medium truncate max-w-[120px] mx-auto">
                              {apptFile.name}
                            </p>
                            <p className="text-[9px] text-stone-500 font-mono">
                              {(apptFile.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApptFile(null);
                              }}
                              className="text-[9px] text-red-400 hover:underline flex items-center gap-1 mx-auto mt-1 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Paperclip className="w-5 h-5 text-stone-400 mx-auto" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-stone-300 block">Device File</span>
                              <span className="text-[9px] text-stone-500 block">Image, PDF or Doc</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* AUDIO UPLOAD */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            if (file.type.startsWith("audio/")) {
                              const base64 = await fileToBase64(file);
                              setApptAudio({ name: file.name, size: file.size, type: file.type, base64 });
                            } else {
                              alert("Please drop an audio file.");
                            }
                          }
                        }}
                        className={`border border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[110px] ${
                          apptAudio ? "border-amber-500/50 bg-amber-500/[0.02]" : "border-white/10 hover:border-amber-400/40 bg-black/20"
                        }`}
                        onClick={() => document.getElementById("file-audio")?.click()}
                      >
                        <input
                          id="file-audio"
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const base64 = await fileToBase64(file);
                              setApptAudio({ name: file.name, size: file.size, type: file.type, base64 });
                            }
                          }}
                        />
                        {apptAudio ? (
                          <div className="space-y-1 w-full">
                            <Music className="w-5 h-5 text-emerald-400 mx-auto animate-pulse" />
                            <p className="text-[10px] text-stone-200 font-medium truncate max-w-[120px] mx-auto">
                              {apptAudio.name}
                            </p>
                            <p className="text-[9px] text-stone-500 font-mono">
                              {(apptAudio.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApptAudio(null);
                              }}
                              className="text-[9px] text-red-400 hover:underline flex items-center gap-1 mx-auto mt-1 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Music className="w-5 h-5 text-stone-400 mx-auto" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-stone-300 block">Voice/Audio</span>
                              <span className="text-[9px] text-stone-500 block">Voice note guide</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* VIDEO UPLOAD */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            if (file.type.startsWith("video/")) {
                              const base64 = await fileToBase64(file);
                              setApptVideo({ name: file.name, size: file.size, type: file.type, base64 });
                            } else {
                              alert("Please drop a video file.");
                            }
                          }
                        }}
                        className={`border border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[110px] ${
                          apptVideo ? "border-amber-500/50 bg-amber-500/[0.02]" : "border-white/10 hover:border-amber-400/40 bg-black/20"
                        }`}
                        onClick={() => document.getElementById("file-video")?.click()}
                      >
                        <input
                          id="file-video"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const base64 = await fileToBase64(file);
                              setApptVideo({ name: file.name, size: file.size, type: file.type, base64 });
                            }
                          }}
                        />
                        {apptVideo ? (
                          <div className="space-y-1 w-full">
                            <Film className="w-5 h-5 text-emerald-400 mx-auto" />
                            <p className="text-[10px] text-stone-200 font-medium truncate max-w-[120px] mx-auto">
                              {apptVideo.name}
                            </p>
                            <p className="text-[9px] text-stone-500 font-mono">
                              {(apptVideo.size / 1048576).toFixed(1)} MB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApptVideo(null);
                              }}
                              className="text-[9px] text-red-400 hover:underline flex items-center gap-1 mx-auto mt-1 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Film className="w-5 h-5 text-stone-400 mx-auto" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-stone-300 block">Style Video</span>
                              <span className="text-[9px] text-stone-500 block">Fitting/Runway clip</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-none hover:brightness-110 transition-all shadow-md cursor-pointer"
                  >
                    Request Reservation Slot
                  </button>
                </form>
              </div>

              {/* SAVED APPOINTMENTS TIMELINE LIST */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
                <h3 className="text-sm uppercase tracking-widest text-amber-400 font-semibold border-b border-white/5 pb-3 font-mono">
                  Your Reservations
                </h3>

                {appointments.length === 0 ? (
                  <p className="text-stone-500 text-xs font-light text-center py-10">No pending or booked consultation blocks on file.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div key={appt.id} className="p-4 bg-white/[0.03] backdrop-blur-sm border border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                            {appt.type.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-none font-mono ${
                              appt.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : appt.status === "PENDING"
                                ? "bg-amber-400/20 text-amber-400 animate-pulse"
                                : "bg-stone-800 text-stone-500"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <div className="text-xs text-stone-300 font-mono space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-stone-500" />
                            <span>{new Date(appt.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="w-3.5 h-3.5 text-stone-500" />
                            <span>
                              {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {" - "}
                              {new Date(appt.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                        {appt.notes && (
                          <p className="text-[10px] text-stone-400 italic font-light border-t border-white/5 pt-2 leading-relaxed">
                            "{appt.notes}"
                          </p>
                        )}

                        {/* Associated Gown */}
                        {appt.associatedProduct && (
                          <div className="mt-2 p-2 bg-black/40 border border-amber-500/10 flex gap-3 items-center">
                            <img
                              src={appt.associatedProduct.image}
                              alt={appt.associatedProduct.name}
                              className="w-10 h-12 object-cover border border-white/5 shrink-0"
                            />
                            <div className="flex-1 overflow-hidden">
                              <span className="text-[8px] uppercase tracking-wider text-amber-400 font-mono font-medium block">
                                Inquired Couture Gown
                              </span>
                              <h4 className="text-[10px] font-serif text-stone-200 truncate">
                                {appt.associatedProduct.name}
                              </h4>
                            </div>
                          </div>
                        )}

                        {/* Attachments Display */}
                        {(appt.attachedFile || appt.attachedAudio || appt.attachedVideo) && (
                          <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
                            <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono font-medium block">
                              Attachments ({[appt.attachedFile, appt.attachedAudio, appt.attachedVideo].filter(Boolean).length})
                            </span>
                            <div className="space-y-2">
                              {/* Device File */}
                              {appt.attachedFile && (
                                <div className="flex items-center justify-between text-[10px] bg-white/[0.02] px-2 py-1.5 border border-white/5">
                                  <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                                    <Paperclip className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="text-stone-300 truncate" title={appt.attachedFile.name}>
                                      {appt.attachedFile.name}
                                    </span>
                                  </div>
                                  <a
                                    href={appt.attachedFile.base64}
                                    download={appt.attachedFile.name}
                                    className="text-[9px] text-amber-400 hover:underline shrink-0 font-medium"
                                  >
                                    View File
                                  </a>
                                </div>
                              )}

                              {/* Audio File */}
                              {appt.attachedAudio && (
                                <div className="text-[10px] bg-white/[0.02] p-2 border border-white/5 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <Music className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="text-stone-300 truncate font-mono">
                                      {appt.attachedAudio.name}
                                    </span>
                                  </div>
                                  <audio
                                    src={appt.attachedAudio.base64}
                                    controls
                                    className="w-full h-6 mt-1 text-xs filter invert opacity-85"
                                  />
                                </div>
                              )}

                              {/* Video File */}
                              {appt.attachedVideo && (
                                <div className="text-[10px] bg-white/[0.02] p-2 border border-white/5 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <Film className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="text-stone-300 truncate font-mono">
                                      {appt.attachedVideo.name}
                                    </span>
                                  </div>
                                  <video
                                    src={appt.attachedVideo.base64}
                                    controls
                                    className="w-full max-h-32 bg-black mt-1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: AI STYLIST & CHAT CONCIERGE */}
        {activeTab === "stylist" && (
          <div className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* AI STYLIST ENGINE */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-mono mb-1">
                    <Sparkles className="w-4.5 h-4.5" />
                    <span className="text-[10px] uppercase tracking-widest font-semibold">AIRSTAR INTELLIGENCE</span>
                  </div>
                  <h3 className="text-xl font-serif text-stone-200">AI Design Swatch Evaluator</h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Instantly generate expert-level styling reviews, fabric recommendations, and care tips based on luxury fashion guides.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider">Garment Category</label>
                    <input
                      type="text"
                      value={stylistQuery.category}
                      onChange={(e) => setStylistQuery({ ...stylistQuery, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider">Fabric Type</label>
                      <input
                        type="text"
                        value={stylistQuery.fabric}
                        onChange={(e) => setStylistQuery({ ...stylistQuery, fabric: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider">Base Color Tone</label>
                      <input
                        type="text"
                        value={stylistQuery.color}
                        onChange={(e) => setStylistQuery({ ...stylistQuery, color: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider">Silhouette Block</label>
                    <input
                      type="text"
                      value={stylistQuery.silhouette}
                      onChange={(e) => setStylistQuery({ ...stylistQuery, silhouette: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1 tracking-wider">Planned Occasion / Focus</label>
                    <input
                      type="text"
                      value={stylistQuery.occasion}
                      onChange={(e) => setStylistQuery({ ...stylistQuery, occasion: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none"
                    />
                  </div>

                  <button
                    onClick={handleStylistGenerate}
                    disabled={stylistLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-none hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
                  >
                    {stylistLoading ? "Drafting Design slopers..." : "Analyze Swatch Synergy"}
                  </button>

                  {stylistResponse && (
                    <div className="bg-black/40 backdrop-blur-sm border border-white/5 p-6 text-xs text-stone-300 leading-relaxed space-y-4 max-h-[350px] overflow-y-auto whitespace-pre-wrap font-sans">
                      {stylistResponse}
                    </div>
                  )}
                </div>
              </div>

              {/* CONCIERGE CHAT WORKBENCH */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col h-[650px]">
                <div className="border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-stone-400 font-mono mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-400">ESTHER ONLINE</span>
                  </div>
                  <h3 className="text-xl font-serif text-stone-200">Luxury Support Desk</h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Ask questions regarding alterations, booking confirmations, sizing updates, or collections details.
                  </p>
                </div>

                {/* Messages grid */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`p-4 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-amber-500 text-stone-950 font-medium"
                            : "bg-black/40 border border-white/5 text-stone-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[8px] text-stone-500 font-mono mt-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="mr-auto p-4 bg-black/40 border border-white/5 text-xs text-stone-400 animate-pulse italic">
                      Esther is writing...
                    </div>
                  )}
                </div>

                {/* Form dispatch */}
                <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Inquire about collections or custom orders..."
                    className="flex-1 bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none font-sans"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="px-4 bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center justify-center rounded-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: ADMIN DASHBOARD CONTROL MODULE */}
        {activeTab === "admin" && (
          <div className="max-w-6xl mx-auto px-6 pt-10 space-y-10">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-stone-900/40 border border-amber-400/20 p-8 backdrop-blur-md shadow-2xl space-y-6 my-10 text-left">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 block font-mono">AIRSTAR SECURE</span>
                  <h3 className="text-2xl font-serif text-stone-100 font-medium">Operations Login</h3>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                    Access requires a registered Gmail account and the secure system access key.
                  </p>
                </div>

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4 font-mono text-xs text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-stone-400 block">Gmail Account</label>
                    <input
                      type="email"
                      required
                      placeholder="username@gmail.com"
                      value={adminLoginEmail}
                      onChange={(e) => setAdminLoginEmail(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-3 py-2.5 outline-none focus:border-amber-400/50 transition-colors rounded-none text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-stone-400 block">Access Key</label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={adminLoginPassword}
                      onChange={(e) => setAdminLoginPassword(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-3 py-2.5 outline-none focus:border-amber-400/50 transition-colors tracking-widest rounded-none text-xs"
                    />
                  </div>

                  {adminLoginError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-300 text-[11px] leading-relaxed">
                      {adminLoginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 transition-colors uppercase tracking-widest cursor-pointer mt-2 rounded-none"
                  >
                    Authenticate Entry
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="border-b border-stone-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono block">
                      AIRSTAR OFFICE
                    </span>
                    <h2 className="text-3xl font-serif tracking-tight text-stone-100">Airstar Operations Manager</h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Adjust active production phases, verify sizing profiles, manage fabrics inventory, and download exports.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 font-mono">
                    <button
                      onClick={() => downloadReport("orders")}
                      className="px-4 py-2 bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-amber-400 text-xs font-semibold rounded-none uppercase transition-all"
                    >
                      Export Orders JSON
                    </button>
                    <button
                      onClick={() => downloadReport("inventory")}
                      className="px-4 py-2 bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-amber-400 text-xs font-semibold rounded-none uppercase transition-all"
                    >
                      Export Inventory XML
                    </button>
                    <button
                      onClick={() => {
                        setIsAdminLoggedIn(false);
                        setAdminLoginEmail("");
                        setAdminLoginPassword("");
                      }}
                      className="px-4 py-2 bg-red-950/45 border border-red-900/40 text-red-300 hover:bg-red-900/30 hover:text-red-200 text-xs font-semibold rounded-none uppercase transition-all flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                </div>

            {/* ADMIN SYSTEM NOTIFICATIONS */}
            {adminNotification && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-mono">
                SYSTEM UPDATE: {adminNotification}
              </div>
            )}

            {/* OPERATION ANALYTICS OVERVIEW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-[10px] uppercase text-stone-500 tracking-wider font-mono">VALUATION BILLINGS</span>
                <h4 className="text-2xl font-serif text-stone-100 font-bold mt-2 font-mono">
                  ₦{adminOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </h4>
                <p className="text-[9px] text-emerald-400 font-mono mt-1">Active client balances</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-[10px] uppercase text-stone-500 tracking-wider font-mono">AIRSTAR ORDERS</span>
                <h4 className="text-2xl font-serif text-stone-100 font-bold mt-2 font-mono">
                  {adminOrders.length}
                </h4>
                <p className="text-[9px] text-amber-400 font-mono mt-1">In active sewing rooms</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-[10px] uppercase text-stone-500 tracking-wider font-mono">FITTINGS BLOCKED</span>
                <h4 className="text-2xl font-serif text-stone-100 font-bold mt-2 font-mono">
                  {adminAppointments.filter((a) => a.status === "APPROVED").length}
                </h4>
                <p className="text-[9px] text-stone-400 font-mono mt-1">Confirmed private sessions</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-[10px] uppercase text-stone-500 tracking-wider font-mono">CRITICAL INVENTORY</span>
                <h4 className="text-2xl font-serif text-stone-100 font-bold mt-2 text-red-400 font-mono">
                  {adminInventory.filter((i) => i.quantity <= i.lowStockAlert).length}
                </h4>
                <p className="text-[9px] text-red-400 font-mono mt-1">Below safety thresholds</p>
              </div>
            </div>

            {/* ORDER CONTROLLER GRID */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
              <h3 className="text-sm uppercase tracking-widest text-amber-400 font-semibold border-b border-white/5 pb-3 font-mono">
                Order Workflow Controller
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-stone-500 uppercase tracking-widest text-[9px]">
                      <th className="pb-3">Order Code</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Couture Gown Type</th>
                      <th className="pb-3">Measurement Block</th>
                      <th className="pb-3 text-center">Status stage</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 text-amber-400 font-bold">{order.orderNumber}</td>
                        <td className="py-4 font-sans font-medium">{order.customerName}</td>
                        <td className="py-4 text-stone-300">{order.dressType}</td>
                        <td className="py-4">
                          <button
                            onClick={() => {
                              alert(`Tailoring slopers measurements for ${order.customerName}:
Bust: ${order.measurementProfile.bust}"
Waist: ${order.measurementProfile.waist}"
Hip: ${order.measurementProfile.hip}"
Height: ${order.measurementProfile.height}"
Sleeve Length: ${order.measurementProfile.sleeveLength}"
Shoulder Width: ${order.measurementProfile.shoulderWidth}"`);
                            }}
                            className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View 22+ Sizing Slopers</span>
                          </button>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-[9px] bg-amber-400/10 text-amber-400 px-2 py-0.5 border border-amber-400/20 font-bold uppercase">
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAdminOrder(order);
                              setAdminOrderNotes(order.specialInstructions || "");
                            }}
                            className="px-3 py-1 bg-white/10 border border-white/10 text-stone-300 hover:text-white text-[10px] font-semibold tracking-wider rounded-none uppercase transition-colors"
                          >
                            Update Progress Stage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEPARATE DIALOG BOX FOR UPDATING SELECTED ORDER WORKFLOW */}
            {selectedAdminOrder && (
              <div className="bg-black/60 backdrop-blur-md border-2 border-amber-500/50 p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-400">STAGE WORKFLOW ASSIGNER</span>
                    <h3 className="text-lg font-serif text-stone-200 mt-1">Adjust {selectedAdminOrder.orderNumber} Progress</h3>
                  </div>
                  <button
                    onClick={() => setSelectedAdminOrder(null)}
                    className="text-stone-400 hover:text-stone-200 font-mono text-xs uppercase"
                  >
                    [ Close ]
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-stone-400 mb-2">Production Stage</label>
                    <select
                      value={selectedAdminOrder.status}
                      onChange={(e) => {
                        const nextStage = e.target.value as OrderStatus;
                        // Auto-assign logical progress percentages based on chosen step
                        const percentages: Record<OrderStatus, number> = {
                          ORDER_RECEIVED: 5,
                          DESIGN_REVIEW: 15,
                          FABRIC_SELECTION: 25,
                          PATTERN_DRAFTING: 35,
                          CUTTING: 45,
                          SEWING: 60,
                          FIRST_FITTING: 70,
                          ALTERATIONS: 80,
                          QUALITY_INSPECTION: 90,
                          PACKAGING: 95,
                          READY_FOR_PICKUP: 98,
                          DELIVERED: 100,
                          CANCELLED: 0
                        };
                        handleAdminStatusChange(selectedAdminOrder.id, nextStage, percentages[nextStage]);
                        setSelectedAdminOrder(null);
                      }}
                      className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none cursor-pointer font-mono"
                    >
                      <option value="ORDER_RECEIVED">1. Order Received</option>
                      <option value="DESIGN_REVIEW">2. Design Review</option>
                      <option value="FABRIC_SELECTION">3. Fabric Sourcing</option>
                      <option value="PATTERN_DRAFTING">4. Pattern Drafting</option>
                      <option value="CUTTING">5. Fabric Precision Cutting</option>
                      <option value="SEWING">6. Sewing Assembly Room</option>
                      <option value="FIRST_FITTING">7. First Fitting Block</option>
                      <option value="ALTERATIONS">8. Seam Alterations</option>
                      <option value="QUALITY_INSPECTION">9. Quality Hand Inspection</option>
                      <option value="PACKAGING">10. Preservation Casing</option>
                      <option value="READY_FOR_PICKUP">11. Awaiting Collection</option>
                      <option value="DELIVERED">12. Delivered & Completed</option>
                      <option value="CANCELLED">X. Cancel Gown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-stone-400 mb-2">Log Update Notes</label>
                    <input
                      type="text"
                      value={adminOrderNotes}
                      onChange={(e) => setAdminOrderNotes(e.target.value)}
                      placeholder="e.g. Lace has been blocked and pinned"
                      className="w-full bg-black/40 border border-white/10 px-4 py-3 text-stone-200 text-xs focus:outline-none focus:border-amber-400 rounded-none font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* APPOINTMENT MANAGEMENTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* APPOINTMENT MANAGER */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
                <h3 className="text-sm uppercase tracking-widest text-amber-400 font-semibold border-b border-white/5 pb-3 font-mono">
                  Fitting Appointment Blocks
                </h3>

                <div className="space-y-4">
                  {adminAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 bg-black/40 border border-white/5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block tracking-wider">
                            {appt.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-stone-300 block font-sans font-medium mt-1">
                            Client: {appt.customerName} ({appt.customerEmail})
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 font-mono ${
                            appt.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : appt.status === "PENDING"
                              ? "bg-amber-400/20 text-amber-400"
                              : "bg-stone-800 text-stone-500"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <p className="text-[10px] text-stone-400 leading-relaxed font-mono">
                        TIMELINE: {new Date(appt.startTime).toLocaleString()}
                      </p>

                      {/* Associated Gown for Admin */}
                      {appt.associatedProduct && (
                        <div className="p-2.5 bg-white/[0.02] border border-amber-500/15 flex gap-3 items-center">
                          <img
                            src={appt.associatedProduct.image}
                            alt={appt.associatedProduct.name}
                            className="w-10 h-12 object-cover border border-white/5 shrink-0"
                          />
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[8px] uppercase tracking-wider text-amber-400 font-mono font-medium block">
                              Inquired Couture Gown
                            </span>
                            <h4 className="text-[10px] font-serif text-stone-200 truncate font-semibold">
                              {appt.associatedProduct.name}
                            </h4>
                            <p className="text-[9px] text-stone-400 font-mono truncate">
                              {appt.associatedProduct.silhouette} · {appt.associatedProduct.fabrics.join(", ")}
                            </p>
                          </div>
                        </div>
                      )}

                      {appt.notes && (
                        <p className="text-[10px] text-stone-400 italic bg-white/[0.01] p-2 border border-white/5 leading-relaxed">
                          Notes: "{appt.notes}"
                        </p>
                      )}

                      {/* Attachments for Admin */}
                      {(appt.attachedFile || appt.attachedAudio || appt.attachedVideo) && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono font-medium block">
                            Attachments ({[appt.attachedFile, appt.attachedAudio, appt.attachedVideo].filter(Boolean).length})
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {appt.attachedFile && (
                              <div className="flex items-center justify-between text-[10px] bg-white/[0.02] px-2 py-1.5 border border-white/5">
                                <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                                  <Paperclip className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="text-stone-300 truncate" title={appt.attachedFile.name}>
                                    {appt.attachedFile.name}
                                  </span>
                                </div>
                                <a
                                  href={appt.attachedFile.base64}
                                  download={appt.attachedFile.name}
                                  className="text-[9px] text-amber-400 hover:underline font-medium shrink-0"
                                >
                                  Download File
                                </a>
                              </div>
                            )}

                            {appt.attachedAudio && (
                              <div className="text-[10px] bg-white/[0.02] p-2 border border-white/5 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <Music className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="text-stone-300 truncate font-mono">
                                    {appt.attachedAudio.name}
                                  </span>
                                </div>
                                <audio
                                  src={appt.attachedAudio.base64}
                                  controls
                                  className="w-full h-6 mt-1 text-xs filter invert opacity-85"
                                />
                              </div>
                            )}

                            {appt.attachedVideo && (
                              <div className="text-[10px] bg-white/[0.02] p-2 border border-white/5 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <Film className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="text-stone-300 truncate font-mono">
                                    {appt.attachedVideo.name}
                                  </span>
                                </div>
                                <video
                                  src={appt.attachedVideo.base64}
                                  controls
                                  className="w-full max-h-32 bg-black mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {appt.status === "PENDING" && (
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleAdminApptStatus(appt.id, "APPROVED")}
                            className="px-3 py-1 bg-emerald-500 text-stone-950 text-[9px] font-bold uppercase rounded-none tracking-wider"
                          >
                            Approve Slot
                          </button>
                          <button
                            onClick={() => handleAdminApptStatus(appt.id, "CANCELLED")}
                            className="px-3 py-1 bg-transparent border border-white/10 text-stone-400 hover:text-white text-[9px] uppercase rounded-none font-bold"
                          >
                            Reject Block
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* INVENTORY TRACKING TABLE */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
                <h3 className="text-sm uppercase tracking-widest text-amber-400 font-semibold border-b border-white/5 pb-3 font-mono">
                  Materials Stock & Supplying
                </h3>

                <div className="space-y-4">
                  {adminInventory.map((item) => {
                    const isLow = item.quantity <= item.lowStockAlert;
                    return (
                      <div key={item.id} className="p-4 bg-black/40 border border-white/5 flex justify-between items-center gap-4">
                        <div className="space-y-1 max-w-[65%]">
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-mono">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-semibold text-stone-200">{item.name}</h4>
                          <span className="text-[10px] text-stone-400 font-mono block">
                            Supplier: {item.supplierName || "Airstar Stock Cabin"}
                          </span>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-xs font-mono">
                            Stock:{" "}
                            <span className={isLow ? "text-red-400 font-bold" : "text-emerald-400"}>
                              {item.quantity} {item.unitOfMeasure}
                            </span>
                          </div>
                          
                          {isLow ? (
                            <button
                              onClick={() => {
                                alert(`Simulated low stock order email dispatched to supplier:
To: ${item.supplierEmail || "wholesale@oceanaccess.com"}
Subject: [CRITICAL LOW STOCK REORDER] Airstar Fashion Home
Order details: ${item.name} (Low stock alert: ${item.lowStockAlert} yards left).`);
                                handleAdminInventoryChange(item.id, item.quantity + 50);
                              }}
                              className="px-2 py-1 bg-red-500 text-stone-950 text-[8px] font-bold uppercase tracking-wider rounded-none"
                            >
                              Supplier Reorder
                            </button>
                          ) : (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleAdminInventoryChange(item.id, Math.max(0, item.quantity - 5))}
                                className="px-1.5 py-0.5 bg-white/10 border border-white/10 text-[9px] hover:bg-white/20 text-stone-300"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleAdminInventoryChange(item.id, item.quantity + 10)}
                                className="px-1.5 py-0.5 bg-white/10 border border-white/10 text-[9px] hover:bg-white/20 text-stone-300"
                              >
                                +10
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CLIENT COUTURE ENQUIRIES */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm uppercase tracking-widest text-amber-400 font-semibold font-mono">
                  Client Couture Enquiries ({adminEnquiries.length})
                </h3>
                <span className="text-[10px] font-mono text-stone-400">
                  {adminEnquiries.filter(e => e.status === "PENDING").length} pending response
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inquiry List */}
                <div className="lg:col-span-2 space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {adminEnquiries.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">No client inquiries received yet.</p>
                  ) : (
                    adminEnquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="p-4 bg-black/40 border border-white/5 hover:border-amber-400/40 transition-all space-y-2 cursor-pointer"
                        onClick={() => {
                          alert(`Client: ${enq.customerName} (${enq.customerEmail})
Subject: ${enq.subject}
Received: ${new Date(enq.createdAt).toLocaleString()}
Status: ${enq.status}

Message:
"${enq.message}"`);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-stone-400">
                              {new Date(enq.createdAt).toLocaleDateString()} · {enq.customerEmail}
                            </span>
                            <h4 className="text-xs font-semibold text-stone-200 mt-0.5">{enq.subject}</h4>
                            <p className="text-[11px] text-stone-400 font-sans line-clamp-1 italic mt-1">
                              "{enq.message}"
                            </p>
                          </div>
                          <span
                            className={`text-[8px] font-bold px-2 py-0.5 font-mono ${
                              enq.status === "ANSWERED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : enq.status === "REVIEWED"
                                ? "bg-sky-500/20 text-sky-300"
                                : "bg-amber-400/20 text-amber-400"
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-white/5 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleAdminEnquiryStatus(enq.id, "REVIEWED")}
                            disabled={enq.status === "REVIEWED" || enq.status === "ANSWERED"}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] hover:bg-white/10 text-stone-300 disabled:opacity-40"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleAdminEnquiryStatus(enq.id, "ANSWERED")}
                            disabled={enq.status === "ANSWERED"}
                            className="px-2 py-0.5 bg-emerald-500 text-stone-950 font-bold text-[9px] hover:bg-emerald-400 disabled:opacity-40"
                          >
                            Answered
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Inquiry Help Board */}
                <div className="p-6 bg-white/[0.02] border border-white/5 space-y-4 text-xs leading-relaxed text-stone-400">
                  <h4 className="font-serif text-stone-200 text-sm font-medium">Airstar Desk Protocol</h4>
                  <p>
                    Every time a visitor or potential client submits an inquiry through the homepage <strong>AIRSTAR DESK</strong>, the data is dispatched securely to this dashboard.
                  </p>
                  <p>
                    As creative director or administrative assistant (Esther), you should inspect incoming specifications, check the fabrics inventory if they ask about lace patterns, and contact them directly at their email address.
                  </p>
                  <div className="p-3 bg-amber-400/5 border border-amber-400/20 text-[11px] text-amber-300/95 font-mono">
                    Note: Email and WhatsApp routing can be completed manually by copying the client email addresses listed here.
                  </div>
                </div>
              </div>
            </div>
              </>
            )}

          </div>
        )}

      </main>

      {/* PRIVACY & COUTURE CONTRACTS DIALOG OVERLAY */}
      {showContractsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl my-8 text-left">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-amber-400 font-mono block mb-1">AIRSTAR FASHION HOME</span>
                <h3 className="text-xl md:text-2xl font-serif text-stone-100 tracking-tight">Couture Agreement & Privacy Policy</h3>
              </div>
              <button 
                onClick={() => setShowContractsModal(false)}
                className="text-stone-400 hover:text-white text-xs uppercase font-mono tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 text-stone-300 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <h4 className="font-mono text-amber-400 font-semibold uppercase tracking-wider text-[10px]">1. Introduction & Airstar Quality Standard</h4>
                <p>
                  At Airstar Fashion Home, we are committed to providing premium luxury garments crafted exclusively to our clients' precise anatomical blueprints. Every custom gown, traditional attire, and high-end suit is treated as a unique artwork. By engaging our services, booking a fitting session, or submitting custom measurements, the client accepts the terms of this Couture Contract.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-amber-400 font-semibold uppercase tracking-wider text-[10px]">2. Physical Sizing, Precision & Tolerances</h4>
                <p>
                  Our pattern drapers block-draft each garment according to the measurements stored in your secure client file. Because each piece is custom-tailored:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-stone-400">
                  <li>A physical dimensional tolerance of up to <span className="text-amber-200 font-medium">±0.25 inches</span> is standard in couture hand-finishing and is not considered a structural defect.</li>
                  <li>In the event of physical metric fluctuations (weight gain or loss) exceeding 4% after the second structural fitting, additional pattern correction fees may apply.</li>
                  <li>For remote clients or those using self-measured blueprints, Airstar Fashion Home guarantees accuracy corresponding directly to the submitted metrics, but is not responsible for errors stemming from initial client measurements.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-amber-400 font-semibold uppercase tracking-wider text-[10px]">3. Fabric Selection & Immutable Pattern Cutting</h4>
                <p>
                  We source rare and exquisite fabrics, including authentic Akwa Ibom laces, imported raw silks, luxury brocades, and heavy satin. Once fabric cutting has commenced for the approved Airstar layout, design specifications, silhouettes, and fabric allocations become entirely immutable. Any subsequent changes will require a new design order.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-amber-400 font-semibold uppercase tracking-wider text-[10px]">4. Secure Client Data & Privacy Safeguards</h4>
                <p>
                  We treat our clients' privacy with the utmost discretion and care.
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-stone-400">
                  <li><strong className="text-stone-300">Confidential Metrics:</strong> Your detailed physical measurements, styling preferences, and anatomical profiles are stored in a secure cloud database and are accessible only to authorized master tailors and pattern drapers assigned to your couture line.</li>
                  <li><strong className="text-stone-300">Media Shield:</strong> Design inspiration images, audio style descriptions, and video files uploaded during booking or consultation are fully private. We will never share, publish, or use client media or completed custom garment fittings on social channels or portfolios without explicit, signed, written consent.</li>
                  <li><strong className="text-stone-300">Data Cleansing:</strong> Clients retain full ownership of their files. You can request a complete purge of your measurement history and portfolio data from our active drapes system at any time.</li>
                </ul>
              </div>

              <div className="space-y-2 text-stone-400 bg-white/[0.02] p-3 border border-white/5">
                <p className="italic">
                  "Sovereignty & Grace aren't just details; they are the framework. We secure your metrics and master your designs with absolute discretion." — Esther, Lead Concierge
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 justify-end">
              <button 
                onClick={() => setShowContractsModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition-all rounded-none cursor-pointer"
              >
                Acknowledge & Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
