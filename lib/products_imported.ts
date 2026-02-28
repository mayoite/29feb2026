import { Sliders, Box, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Product {
    id: string;
    name: string;
    category: string; // e.g., "desks", "storage"
    slogan: string;
    description: string;
    price: number;
    features: {
        icon: LucideIcon;
        title: string;
        text: string;
    }[];
    gallery: string[];
    specs: {
        label: string;
        value: string;
    }[];
}

export const PRODUCTS: Product[] = [
    {
        id: "winea-pro",
        name: "WINEA PRO",
        category: "desks",
        slogan: "The System for Every Requirement.",
        description: "WINEA PRO is the versatile table system that adapts to every requirement. Whether as a single workstation, team office, or meeting table - the clear design language and intelligent technology make WINEA PRO the perfect choice for modern working environments.",
        price: 899,
        features: [
            { icon: Sliders, title: "Ergonomics", text: "Electric height adjustment from 65 to 125 cm." },
            { icon: Box, title: "Modularity", text: "Infinite configurations for individuals and teams." },
            { icon: Info, title: "Organization", text: "Integrated cable management and sliding top options." },
        ],
        gallery: [
            "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000"
        ],
        specs: [
            { label: "Dimensions", value: "Width: 80-240cm | Depth: 80-100cm" },
            { label: "Electrification", value: "Horizontal cable tray, vertical cable chain" },
            { label: "Materials", value: "Melamine, Veneer, Steel, Aluminium" },
        ]
    },
    {
        id: "winea-flow",
        name: "WINEA FLOW",
        category: "desks",
        slogan: "Flowing Design. Dynamic Work.",
        description: "WINEA FLOW stands for dynamic working. The design features soft radii and sloping lines, creating a unique aesthetic that encourages movement and interaction.",
        price: 1050,
        features: [
            { icon: Sliders, title: "Speed", text: "Fastest height adjustment in its class." },
            { icon: Box, title: "Soft Edge", text: "Rounded corners for safety and comfort." },
            { icon: Info, title: "Smart", text: "App control and occupancy sensors available." },
        ],
        gallery: [
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=2000"
        ],
        specs: [
            { label: "Dimensions", value: "Width: 160-200cm | Depth: 80-90cm" },
            { label: "Lift Speed", value: "70mm/s" },
            { label: "Design Award", value: "Red Dot Winner 2025" },
        ]
    },
    {
        id: "winea-maxx",
        name: "WINEA MAXX",
        category: "storage",
        slogan: "Maximum Storage. Minimal Design.",
        description: "The cabinet system WINEA MAXX offers maximum storage space with a minimalist design. It creates structure in the office and can be used as a room divider.",
        price: 550,
        features: [
            { icon: Box, title: "Capacity", text: "Optimized for standard file folders." },
            { icon: Sliders, title: "Acoustics", text: "Acoustically effective fronts available." },
            { icon: Info, title: "Diversity", text: "Available as closet, sideboard, or pedestal." },
        ],
        gallery: [
            "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000",
            "https://images.unsplash.com/photo-1497215842964-2229243e8a01?auto=format&fit=crop&q=80&w=2000"
        ],
        specs: [
            { label: "Grid Heights", value: "2OH, 3OH, 4OH, 5OH, 6OH" },
            { label: "Widths", value: "40, 60, 80, 100, 120 cm" },
            { label: "Locking", value: "RFID or Key" },
        ]
    }
];

export const CATEGORIES = [
    { id: "desks", title: "Desks", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000" },
    { id: "storage", title: "Storage", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000" },
    { id: "meeting", title: "Meeting", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=2000" },
    { id: "acoustics", title: "Room Acoustics", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2000" },
    { id: "reception", title: "Reception", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000" },
    { id: "seating", title: "Seating", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=2000" }
];
