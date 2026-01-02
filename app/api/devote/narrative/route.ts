import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type Answer = {
    id: string;   // "Qp1" | ... | "Qai5"
    label: string;
};

export async function POST(req: NextRequest) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "Missing OPENAI_API_KEY" },
            { status: 500 }
        );
    }

    let body: { answers: Answer[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Bad JSON body" }, { status: 400 });
    }

    const get = (id: string) =>
        body.answers.find((a) => a.id === id)?.label ?? "not specified";

    const industry = get("Qp1");
    const goal = get("Qp2");
    const pain = get("Qp3");

    // crude heuristics for MVP
    const vessel =
        /regulat|audit|compliance/i.test(goal) || /regulat/i.test(pain)
            ? "Regulatory Submission"
            : /fund|invest/i.test(goal)
                ? "Investor Memo"
                : /internal|ops|process/i.test(goal)
                    ? "Internal Report"
                    : "Case Study";

    const dramaticEngine = /crisis|breach|scandal|fraud|dispute/i.test(pain)
        ? "Crisis Averted"
        : /growth|expansion|new market|innovation/i.test(goal)
            ? "Opportunity Seized"
            : "Legacy Transformed";

    const proofPoints: string[] = [];
    if (/audit|regulat|compliance|evidence/i.test(goal + pain))
        proofPoints.push("Immutable Audit Trail");
    if (/fraud|abuse|sybil|duplicate|identity/i.test(pain))
        proofPoints.push("Sybil-Resistant Identity");
    if (/cost|budget|overrun|expense/i.test(goal + pain))
        proofPoints.push("Cost-Per-Trust Metric");
    proofPoints.push("ZK-Verified Tally");
    const uniqueProofs = [...new Set(proofPoints)].slice(0, 3);

    const extraContext = body.answers
        .filter((a) => a.id.startsWith("Qai"))
        .map((a) => `- ${a.id}: ${a.label}`)
        .join("\n");

    const prompt = `
You are drafting a ${vessel} for a ${industry} organization evaluating DeVOTE's verifiable governance platform.

Context from their answers:
- Primary goal: ${goal}
- Key vulnerability: ${pain}
- Additional context:
${extraContext || "- No additional details"}

Narrative requirements:
- Use the emotional arc "${dramaticEngine}".
- Weave in these specific DeVOTE capabilities as concrete mechanisms, not buzzwords:
  ${uniqueProofs.map((p) => `- ${p}`).join("\n  ")}
- Length: 300–400 words.
- Tone: professional but vivid and specific; suitable for board or investor decks.
- Open with a strong hook anchored in their pain point.
- Explain clearly how verifiable governance addresses their situation.
- Close with a concrete future-state scenario (what changes once DeVOTE is deployed).
- Avoid generic corporate filler language.

Output: plain text only, no headings or markdown.
`.trim();

    async function callOnce(): Promise<string> {
        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: prompt,
            temperature: 0.5,
        });
        const text = response.output_text;
        if (!text) throw new Error("Empty AI response");
        return text.trim();
    }

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const narrative = await callOnce();
            return NextResponse.json({ narrative });
        } catch (err) {
            lastError = err;
            if (attempt < 2) {
                const delay = 1000 * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    console.error("Narrative assembly failed:", lastError);
    return NextResponse.json(
        {
            error:
                "We couldn't assemble your narrative right now. Please try again later or contact the DeVOTE team.",
        },
        { status: 500 }
    );
}
