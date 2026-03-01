// Product interface is defined here, so we don't import it.
export interface Product {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: string;
    description: string;
    images: string[];
    features: string[];
    specs: { label: string; value: string }[];
    related: string[];
    badge?: string;      // "Bestseller" | "Premium" | "New"
    tagline?: string;    // Short marketing tagline
    warranty?: string;   // "5 Years" etc
}

export const products: Product[] = [
    // --- Chairs (Legacy entries removed in favor of imported products) ---
    // Fluid, Fluid X, Myel, Spino are now loaded from products_imported.ts
    {
        id: "cafeteria-1",
        slug: "cafeteria-seating",
        name: "Cafeteria Seating",
        category: "Cafe",
        price: "₹4,500",
        description: "Vibrant and durable seating for cafeterias and breakout zones. Easy to clean and stackable.",
        images: ["/images/products/chair-cafeteria.webp"],
        features: ["Stackable", "Easy Clean", "Vibrant Colors", "Durable"],
        specs: [{ label: "Material", value: "Polypropylene" }],
        related: ["classy-series"]
    },
    // Classy Series removed

    // --- Workstations ---
    {
        id: "deskpro-1",
        slug: "deskpro-system",
        name: "DeskPro System",
        category: "Workstations",
        price: "₹25,000 per seat",
        description: "A highly modular workstation system designed for productivity. Integrated cable management and privacy screens.",
        images: ["/images/products/deskpro-workstation-1.webp"],
        features: ["Modular", "Cable Management", "Privacy Screen", "Customizable Colors"],
        specs: [{ label: "Table Top", value: "25mm PLPB" }, { label: "Legs", value: "Powder Coated" }],
        related: ["linear-workstation", "myel-executive-chair"]
    },
    {
        id: "linear-1",
        slug: "linear-workstation",
        name: "Linear Workstation",
        category: "Workstations",
        price: "₹22,000 per seat",
        description: "Clean lines and open design. The Linear Workstation is perfect for modern, collaborative offices.",
        images: ["/images/products/linear-workstation-1.webp"],
        features: ["Linear Layout", "Shared Legs", "Cost Effective"],
        specs: [{ label: "Width", value: "1200mm per seat" }],
        related: ["deskpro-system"]
    },
    {
        id: "60x30-1",
        slug: "60x30-modular",
        name: "60x30 Modular System",
        category: "Workstations",
        price: "PO A",
        description: "A robust partitioning system based on 60mm and 30mm profiles. Ideal for creating cubicles and semi-private spaces.",
        images: ["/images/products/60x30-workstation-1.webp"],
        features: ["High Partition", "Glass Options", "Pinup Boards", "Raceways"],
        specs: [{ label: "Thouckness", value: "60mm" }],
        related: ["tcs-workspace"]
    },
    {
        id: "tcs-1",
        slug: "tcs-workspace",
        name: "TCS Workspace",
        category: "Workstations",
        price: "PO A",
        description: "A custom-designed workspace solution tailored for large corporate requirements.",
        images: ["/images/products/tcs-workspace-1.webp"],
        features: ["Custom Dimensions", "Corporate Branding", "Heavy Duty"],
        specs: [{ label: "Usage", value: "IT / Corporate" }],
        related: ["honda-office"]
    },
    {
        id: "honda-1",
        slug: "honda-office",
        name: "Honda Office Setup",
        category: "Workstations",
        price: "PO A",
        description: "Premium office setup showcasing our capabilities in delivering large-scale infrastructure projects.",
        images: ["/images/products/honda-office-1.webp"],
        features: ["Turnkey Solution", "Premium Finishes"],
        specs: [{ label: "Client", value: "Honda" }],
        related: ["deskpro-system"]
    },

    // --- Meeting Tables ---
    {
        id: "meet-exec",
        slug: "executive-meeting-table",
        name: "Executive Meeting Table",
        category: "Meeting Tables",
        price: "₹1,50,000",
        description: "A grand meeting table for the boardroom. Features power connectivity and a premium finish.",
        images: ["/images/products/meeting-table-10pax.webp"],
        features: ["Power Box", "Wire Manager", "Premium Veneer", "10-12 Seater"],
        specs: [{ label: "Size", value: "3000 x 1200 mm" }],
        related: ["compact-meeting-table"]
    },
    {
        id: "meet-compact",
        slug: "compact-meeting-table",
        name: "Compact Meeting Table",
        category: "Meeting Tables",
        price: "₹45,000",
        description: "A round or square meeting table for huddle rooms and small discussions.",
        images: ["/images/products/meeting-table-6pax.webp"],
        features: ["Compact", "Stable Base", "Modern Look"],
        specs: [{ label: "Seating", value: "4-6 Pax" }],
        related: ["executive-meeting-table"]
    },
    {
        id: "conf-setup",
        slug: "conference-setup",
        name: "Conference Video Setup",
        category: "Meeting Tables",
        price: "PO A",
        description: "Specialized table designed for video conferencing, ensuring everyone is visible.",
        images: ["/images/products/meeting table top render.webp"],
        features: ["V-Shape", "Integrated Tech", "Acoustics"],
        specs: [{ label: "Type", value: "Video Conference" }],
        related: ["executive-meeting-table"]
    },

    // --- Soft Seating ---
    {
        id: "3",
        slug: "solace-lounge-chair",
        name: "Solace Lounge",
        category: "Soft Seating",
        price: "₹85,000",
        description: "Crafted calm. A plush soft seating collection designed for lobbies and collaborative breakout zones.",
        images: ["/images/products/solace-chair-1.webp", "/images/products/softseating-solace-1.webp"],
        features: ["Premium Upholstery", "Acoustic Comfort", "Modular"],
        specs: [{ label: "Configuration", value: "Lounge" }],
        related: ["myel-executive-chair"]
    },

    // --- Storage ---
    {
        id: "stor-1",
        slug: "cabin-drawer",
        name: "Cabin Drawer Unit",
        category: "Storage",
        price: "₹8,500",
        description: "Essential mobile pedestal for under-desk storage. Lockable and durable.",
        images: ["/images/products/cabin drawer close up render.webp"],
        features: ["3 Drawers", "Central Lock", "Castors"],
        specs: [{ label: "Material", value: "Metal / Laminate" }],
        related: ["office-storage"]
    },
    {
        id: "stor-2",
        slug: "office-storage",
        name: "Office Storage System",
        category: "Storage",
        price: "₹25,000",
        description: "Full-height storage units and filing cabinets to keep your office organized.",
        images: ["/images/products/cabin electrical render .webp"],
        features: ["Adjustable Shelves", "Lockable", "Modular"],
        specs: [{ label: "Height", value: "2100mm" }],
        related: ["cabin-drawer"]
    },

    // --- Others ---
    {
        id: "pod-1",
        slug: "nuvora-pod",
        name: "Nuvora Pod",
        category: "Others",
        price: "₹3,50,000",
        description: "A private acoustic pod for focused work or phone calls. Soundproof and ventilated.",
        images: ["/images/products/nuvora-pod-1.webp"],
        features: ["Soundproof", "Ventilation", "Lighting", "Power Socket"],
        specs: [{ label: "Size", value: "1 Pax" }],
        related: ["nuvora-pod-2"]
    },
    {
        id: "pod-2",
        slug: "nuvora-pod-2",
        name: "Nuvora Pod 2",
        category: "Others",
        price: "PO A",
        description: "Larger acoustic pod variations.",
        images: ["/images/products/nuvora-pod-2.webp"],
        features: ["Soundproof", "Ventilation"],
        specs: [{ label: "Variant", value: "Model 2" }],
        related: ["nuvora-pod"]
    },
    {
        id: "pod-3",
        slug: "nuvora-pod-3",
        name: "Nuvora Pod 3",
        category: "Others",
        price: "PO A",
        description: "Larger acoustic pod variations.",
        images: ["/images/products/nuvora-pod-3.webp"],
        features: ["Soundproof", "Ventilation"],
        specs: [{ label: "Variant", value: "Model 3" }],
        related: ["nuvora-pod"]
    },
    {
        id: "tray-1",
        slug: "paper-tray",
        name: "Paper Tray",
        category: "Others",
        price: "₹1,500",
        description: "Desk accessory for organizing documents.",
        images: ["/images/products/dauble paper tray.webp"],
        features: ["Double Tray", "Stackable"],
        specs: [{ label: "Material", value: "Plastic/Mesh" }],
        related: ["deskpro-system"]
    },

    // --- Projects ---
    {
        id: "proj-1",
        slug: "project-dmrc",
        name: "DMRC Office",
        category: "Projects",
        price: "Project",
        description: "Office setup for Delhi Metro Rail Corporation.",
        images: ["/hero/dmrc-hero.webp"],
        features: ["Large Scale", "Government"],
        specs: [{ label: "Location", value: "Delhi" }],
        related: []
    },
    {
        id: "proj-2",
        slug: "project-titan",
        name: "Titan Corporate",
        category: "Projects",
        price: "Project",
        description: "Corporate office for Titan.",
        images: ["/hero/titan-hero.webp"],
        features: ["Corporate", "Workstations"],
        specs: [{ label: "Location", value: "Bangalore" }],
        related: []
    },
    {
        id: "proj-3",
        slug: "project-usha",
        name: "Usha International",
        category: "Projects",
        price: "Project",
        description: "Office interior for Usha International.",
        images: ["/hero/usha-hero.webp"],
        features: ["Corporate", "Design"],
        specs: [{ label: "Location", value: "Gurgaon" }],
        related: []
    },
    {
        id: "proj-4",
        slug: "project-abdul-hai",
        name: "Abdul Hai Office",
        category: "Projects",
        price: "Project",
        description: "Private office setup.",
        images: ["/projects/abdul-hai/IMG_20191114_130520.webp"],
        features: ["Private", "Luxury"],
        specs: [{ label: "Type", value: "Private Office" }],
        related: []
    },

    // --- Catalog India Products (Added) ---
    // Workstations
    {
        id: "catalog-ws-1",
        slug: "curvivo-workstation",
        name: "Curvivo",
        category: "Workstations",
        price: "PO A",
        description: "A dynamic and innovative workstation that is adaptable to different workspaces. Curvivo office solution for enhanced efficiency, embracing fluidity and harmony.",
        images: ["/images/products/imported/cabin/image-1.webp"],
        features: ["Enhanced Efficiency", "Fluid Design", "Collaborative"],
        specs: [{ label: "Material", value: "Premium Laminate" }],
        related: ["deskpro-system"]
    },
    {
        id: "catalog-ws-2",
        slug: "sleek-workstation",
        name: "Sleek",
        category: "Workstations",
        price: "PO A",
        description: "Minimalist design implementation for maximum focus. The Sleek system disappears into the room.",
        images: ["/images/products/linear-workstation-1.webp"], // Placeholder
        features: ["Minimalist", "Hidden Cable Tray", "Slim Profile"],
        specs: [{ label: "Legs", value: "Aluminum Profile" }],
        related: ["linear-workstation"]
    },
    {
        id: "catalog-ws-3",
        slug: "adaptable-system",
        name: "Adaptable",
        category: "Workstations",
        price: "PO A",
        description: "A future-proof workstation system that grows with your team. Reconfigurable and robust.",
        images: ["/images/products/60x30-workstation-1.webp"], // Placeholder
        features: ["Future Proof", "Reconfigurable", "Heavy Duty"],
        specs: [{ label: "load", value: "Tested for 150kg" }],
        related: ["60x30-modular"]
    },

    // Chairs
    {
        id: "catalog-ch-1",
        slug: "halo-chair",
        name: "Halo",
        category: "Chairs",
        price: "PO A",
        description: "Halo ergonomic mesh chair with a wide headrest and supportive shell design. Engineered for daily productivity and style.",
        images: ["/images/products/imported/halo/image-1.webp"],
        features: ["Wide Headrest", "Supportive Shell Design", "Premium Mesh Breathability"],
        specs: [{ label: "Mechanism", value: "Synchronous Tilt" }],
        related: ["arvo-chair"]
    },
    {
        id: "catalog-ch-2",
        slug: "arvo-chair",
        name: "Arvo",
        category: "Chairs",
        price: "PO A",
        description: "Precision engineering meets ergonomic excellence. Arvo is built for long work sessions.",
        images: ["/images/products/chair-myel-main.webp"], // Placeholder
        features: ["High Back", "Headrest", "4D Armrests"],
        specs: [{ label: "Base", value: "Chrome Star Base" }],
        related: ["snap-chair"]
    },
    {
        id: "catalog-ch-3",
        slug: "myel-chair",
        name: "Myel",
        category: "Chairs",
        price: "PO A",
        description: "A task chair for modern thinkers. MYEL combines weight-sensitive tilt and a dynamic backrest for effortless support.",
        images: ["/images/products/imported/myel/with-headrest/image-1.webp"],
        features: ["Weight-sensitive Tilt", "Dynamic Backrest", "Adjustable Armrests"],
        specs: [{ label: "Material", value: "Breathable Mesh" }],
        related: ["phoenix-chair"]
    },
    {
        id: "catalog-ch-4",
        slug: "phoenix-chair",
        name: "Phoenix",
        category: "Chairs",
        price: "PO A",
        description: "Phoenix ergonomic chair designed for durability and comprehensive support. Includes a wide headrest and white frame.",
        images: ["/images/products/imported/phoenix/image-1.webp"],
        features: ["White Modern Frame", "Advanced Ergonomics", "Tilt Lock"],
        specs: [{ label: "Base", value: "Aluminum / Nylon" }],
        related: ["pinnacle-chair"]
    },
    {
        id: "catalog-ch-5",
        slug: "solace-chair",
        name: "Solace",
        category: "Chairs",
        price: "PO A",
        description: "Solace ergonomic office chair designed for superior posture support and daily comfort.",
        images: ["/images/products/imported/solace/image-1.webp"],
        features: ["Lumbar Support", "Mesh Back", "Ergonomic Design"],
        specs: [{ label: "Type", value: "Task Chair" }],
        related: ["nordic-chair"]
    },
    {
        id: "catalog-ch-6",
        slug: "nordic-chair",
        name: "Nordic",
        category: "Chairs",
        price: "PO A",
        description: "Scandanavian inspired minimalism. Perfect for breakout zones and casual meetings.",
        images: ["/images/products/chair-cafeteria.webp"], // Placeholder
        features: ["Wooden Legs", "Shell Design", "Minimalist"],
        specs: [{ label: "Style", value: "Nordic" }],
        related: ["ember-chair"]
    },
    {
        id: "catalog-ch-7",
        slug: "sway-chair",
        name: "Sway",
        category: "Chairs",
        price: "PO A",
        description: "Sway ergonomic mesh chairs designed for posture support and long-term comfort with high mesh back.",
        images: ["/images/products/imported/sway/image-1.webp"],
        features: ["Adjustable Headrest", "Synchronous Tilt", "Lumbar Support"],
        specs: [{ label: "Mechanism", value: "Synchronous" }],
        related: ["halo-chair"]
    },

    // Tables
    {
        id: "catalog-tb-1",
        slug: "exquisite-table",
        name: "Exquisite",
        category: "Meeting Tables",
        price: "PO A",
        description: "Exquisite blends refined craftsmanship with modern authority. It uses premium veneers and precise detailing to create a bold presence.",
        images: ["/images/products/imported/cabin/image-1.webp"],
        features: ["Premium Veneer", "Built-in Connectivity", "Refined Craftsmanship"],
        specs: [{ label: "Finish", value: "Walnut / Oak" }],
        related: ["collaborate-table"]
    },
    {
        id: "catalog-tb-2",
        slug: "collaborate-table",
        name: "Collaborate",
        category: "Meeting Tables",
        price: "PO A",
        description: "Designed for teamwork. The Collaborate table brings people together effortlessly.",
        images: ["/images/products/meeting-table-6pax.webp"], // Placeholder
        features: ["Cable Management", "Durable Top", "Various Sizes"],
        specs: [{ label: "Shape", value: "Rectangular / Racetrack" }],
        related: ["exquisite-table"]
    }
];

export const categories = ["Workstations", "Chairs", "Meeting Tables", "Soft Seating", "Storage", "Projects", "Task Chair"];
