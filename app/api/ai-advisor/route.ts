import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getProducts } from "@/lib/getProducts";
import { supabase } from "@/lib/db";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "placeholder",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "One and Only Furniture",
    }
});

export async function POST(req: NextRequest) {
    console.log("➡️  [ai-advisor] POST request received");
    try {
        const { query, userId } = await req.json();
        console.log("📝  [ai-advisor] Query:", query, "User:", userId);

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "AI advisor is not configured. Please add OPENROUTER_API_KEY." },
                { status: 503 }
            );
        }

        // Fetch user history from Supabase if authenticated/provided
        let historyContext = "";
        if (userId) {
            const { data } = await supabase
                .from("user_history")
                .select("viewed_products")
                .eq("user_id", userId)
                .single();
            if (data?.viewed_products?.length) {
                historyContext = `\nClient History (Recently Viewed Products): ${data.viewed_products.join(", ")}\nPrioritize recommending complementary or similar items based on this history.`;
            }
        }

        // Fetch product catalog from Supabase
        const products = await getProducts();

        // Build a compact product list for the prompt (name, slug, category, description)
        const productList = products
            .slice(0, 80) // limit context size
            .map(
                (p) =>
                    `- ID: ${p.slug} | Name: ${p.name} | Category: ${p.category_id} | ${p.description?.slice(0, 80)}`
            )
            .join("\n");

        const systemPrompt = `You are an enterprise workspace engineering consultant for One & Only Furniture (Patna, Bihar India — Regional Partner).
Your role is to recommend the best workspace systems from our catalog based on the client's requirements.
Always recommend 3-5 specific products. Consider: team size, industry, budget sensitivity, location (Bihar/India context), and ergonomic needs.
Bias toward ergonomic seating + modular workstations for government/corporate, and collaborative/soft-seating for creative/startup environments.${historyContext}

Available products:\n${productList}

Respond ONLY with valid JSON in this exact shape:
{
  "recommendations": [
    {
      "productId": "<slug from catalog>",
      "productName": "<name>",
      "category": "<category>",
      "why": "<one sentence engineering rationale>",
      "budgetEstimate": "<INR range e.g. ₹45,000 – ₹65,000 per unit>"
    }
  ],
  "totalBudget": "<estimated project total range>",
  "summary": "<2-sentence enterprise consultation summary>"
}`;

        console.log("🤖  [ai-advisor] Calling OpenRouter...");
        const completion = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
            temperature: 0.4,
        });
        console.log("✅  [ai-advisor] OpenRouter response received");

        let raw = completion.choices[0]?.message?.content ?? "{}";
        raw = raw.replace(/^```json\n/, "").replace(/\n```$/, "").trim();
        const result = JSON.parse(raw);

        return NextResponse.json(result);
    } catch (err) {
        console.error("[ai-advisor] Error:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
            { error: `Failed to generate recommendations: ${errorMessage}` },
            { status: 500 }
        );
    }
}

