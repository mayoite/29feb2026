"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CookieConsent() {
    const [show, setShow] = useState(() => {
        if (typeof window === "undefined") return false;
        return !localStorage.getItem("oando-cookie-consent");
    });

    const handleAccept = () => {
        localStorage.setItem("oando-cookie-consent", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-neutral-900 text-white p-6 z-50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="text-sm font-light max-w-2xl">
                <p>
                    We use cookies to optimize our website and our service.
                    <a href="/privacy" className="underline hover:text-neutral-300 ml-1">
                        Privacy Policy
                    </a>
                </p>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShow(false)} className="border-white text-white hover:bg-white hover:text-neutral-900">
                    Decline
                </Button>
                <Button onClick={handleAccept} className="bg-primary text-white hover:bg-red-700">
                    Accept All
                </Button>
            </div>
        </div>
    );
}
