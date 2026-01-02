import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type PrelimAnswer = {
    id: string;          // "Qp1" | "Qp2" | "Qp3"
    label: string;       // text of chosen option / Other
};

type AiQuestion = {
    id: string;          // "Qai1"..."Qai5"
    question: string;
    options: string[];   // length 6
};

export async function POST(req: NextRequest) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "Missing OPENAI_API_KEY" },
            { status: 500 }
        );
    }

    let body: { prelimAnswers: PrelimAnswer[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Bad JSON body" }, { status: 400 });
    }

    const industry =
        body.prelimAnswers.find((a) => a.id === "Qp1")?.label ?? "their sector";
    const goal =
        body.prelimAnswers.find((a) => a.id === "Qp2")?.label ??
        "improving governance";
    const pain =
        body.prelimAnswers.find((a) => a.id === "Qp3")?.label ??
        "trust and compliance gaps";

    const systemMessage = `
You are an expert governance consultant helping DeVOTE create tailored diagnostic questions for governance pilots.

You MUST:
- Generate exactly 5 multiple-choice questions (Qai1–Qai5)
- Each question MUST have exactly 6 options
- Questions must progress from broad (Qai1) to strategic (Qai5)
- Reference the user's industry, goal, and vulnerability
- Avoid copying user words verbatim
- Return ONLY valid JSON, no other text

Output format:
{
  "questions": [
    { "id": "Qai1", "question": "...", "options": ["...", "...", "...", "...", "...", "..."] },
    { "id": "Qai2", "question": "...", "options": ["...", "...", "...", "...", "...", "..."] },
    { "id": "Qai3", "question": "...", "options": ["...", "...", "...", "...", "...", "..."] },
    { "id": "Qai4", "question": "...", "options": ["...", "...", "...", "...", "...", "..."] },
    { "id": "Qai5", "question": "...", "options": ["...", "...", "...", "...", "...", "..."] }
  ]
}`;

    const userMessage = `
User context:
- Industry: ${industry}
- Primary goal: ${goal}
- Biggest vulnerability: ${pain}

Create 5 governance diagnostic questions that surface operational constraints, stakeholder dynamics, and competitive pressure.`;

    async function callOnce(): Promise<AiQuestion[]> {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
        });

        const text = response.choices[0].message.content;
        if (!text) throw new Error("Empty AI response");

        let parsed: { questions: AiQuestion[] };
        try {
            parsed = JSON.parse(text);
        } catch {
            throw new Error("Failed to parse AI JSON");
        }

        if (
            !parsed.questions ||
            parsed.questions.length !== 5 ||
            parsed.questions.some((q) => !q.options || q.options.length !== 6)
        ) {
            throw new Error("Invalid questions shape");
        }

        return parsed.questions;
    }

    // 3 attempts with backoff: 1s, 2s, 4s
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const questions = await callOnce();
            return NextResponse.json({ questions });
        } catch (err) {
            lastError = err;
            if (attempt < 2) {
                const delay = 1000 * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    console.error("AI question generation failed:", lastError);
    return NextResponse.json(
        {
            error:
                "We couldn't generate tailored questions right now. Please try again later or book a call with the DeVOTE team.",
        },
        { status: 500 }
    );
}
