import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

type TrackingPayload = {
    productId?: string;
};

function getBearerToken(req: NextRequest): string | null {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match?.[1]) return null;

    return match[1].trim();
}

export async function POST(req: NextRequest) {
    try {
        const token = getBearerToken(req);
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        const userId = authData?.user?.id;

        if (authError || !userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = (await req.json()) as TrackingPayload;
        const normalizedProductId = typeof productId === "string" ? productId.trim() : "";

        if (!normalizedProductId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        // Fetch current history
        const { data, error } = await supabase
            .from("user_history")
            .select("viewed_products")
            .eq("user_id", userId)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Supabase fetch error:", error);
        }

        let viewedProducts = Array.isArray(data?.viewed_products)
            ? data.viewed_products.filter((item): item is string => typeof item === "string")
            : [];

        // Add without duplicates or push newest
        if (!viewedProducts.includes(normalizedProductId)) {
            viewedProducts = [...viewedProducts, normalizedProductId].slice(-10); // Keep last 10

            const { error: upsertError } = await supabase
                .from("user_history")
                .upsert({ user_id: userId, viewed_products: viewedProducts, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

            if (upsertError) {
                console.error("Supabase upsert error:", upsertError.message);
                return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, viewedProducts });
    } catch (err) {
        console.error("Tracking API Error:", err);
        return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
    }
}
