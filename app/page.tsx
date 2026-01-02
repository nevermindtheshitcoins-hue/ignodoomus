"use client";

import React, { useState } from "react";

type QuestionDef = {
  id: string;
  title: string;
  description?: string;
  options: string[];
};

type AnswerRecord = {
  id: string;
  choiceIndex: number;
  label: string;
};

type UiStep =
  | "PRELIM_1"
  | "PRELIM_2"
  | "PRELIM_3"
  | "LOADING_AI_QUESTIONS"
  | "AI_Q1"
  | "AI_Q2"
  | "AI_Q3"
  | "AI_Q4"
  | "AI_Q5"
  | "LOADING_NARRATIVE"
  | "REPORT"
  | "ERROR";

const PRELIM_QUESTIONS: QuestionDef[] = [
  {
    id: "Qp1",
    title: "What best describes your role in governance decisions?",
    options: [
      "Executive leadership (CEO, COO, Board)",
      "VP or Director of Operations",
      "Compliance or Legal Officer",
      "Technology or IT Leadership",
      "Innovation or Strategy Consultant",
      "Partnership or Business Development Lead",
    ],
  },
  {
    id: "Qp2",
    title: "What is your primary objective for exploring verifiable governance?",
    options: [
      "Unlock new funding or investor confidence",
      "Meet or stay ahead of regulatory expectations",
      "Repair or strengthen stakeholder trust",
      "Reduce the cost + drag of disputes",
      "Make decision-making more transparent",
      "Detect and prevent fraud/abuse earlier",
    ],
  },
  {
    id: "Qp3",
    title: "Which vulnerability keeps you most on edge today?",
    options: [
      "Election or voting disputes that won't die",
      "Painful audits and evidence gathering",
      "Gaps in proof when challenged by outsiders",
      "Stakeholder skepticism and rumor cycles",
      "Manual, error-prone governance processes",
      "Legacy systems you know will eventually fail",
    ],
  },
];

function isValidOther(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 5 || trimmed.length > 50) return false;
  if (/\n/.test(trimmed)) return false;
  return true;
}

async function postWithRetries<T>(
  url: string,
  body: unknown,
  maxAttempts = 3
): Promise<T> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError ?? new Error("Unknown network error");
}

export default function Home() {
  const [step, setStep] = useState<UiStep>("PRELIM_1");
  const [prelimAnswers, setPrelimAnswers] = useState<AnswerRecord[]>([]);
  const [aiQuestions, setAiQuestions] = useState<QuestionDef[]>([]);
  const [aiAnswers, setAiAnswers] = useState<AnswerRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [otherText, setOtherText] = useState("");
  const [screenMessage, setScreenMessage] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string>("");
  const [displayedNarrative, setDisplayedNarrative] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const allAnswers: AnswerRecord[] = [...prelimAnswers, ...aiAnswers].sort(
    (a, b) => a.id.localeCompare(b.id)
  );

  const nixieDigits: (number | null)[] = Array(8).fill(null);
  const orderedIds = ["Qp1", "Qp2", "Qp3", "Qai1", "Qai2", "Qai3", "Qai4", "Qai5"];
  orderedIds.forEach((id, idx) => {
    const found =
      prelimAnswers.find((a) => a.id === id) ||
      aiAnswers.find((a) => a.id === id);
    if (found) nixieDigits[idx] = found.choiceIndex + 1;
  });

  const isOnPrelim =
    step === "PRELIM_1" || step === "PRELIM_2" || step === "PRELIM_3";
  const currentPrelimIndex =
    step === "PRELIM_1" ? 0 : step === "PRELIM_2" ? 1 : 2;

  const aiIndexMap: Record<UiStep, number> = {
    AI_Q1: 0,
    AI_Q2: 1,
    AI_Q3: 2,
    AI_Q4: 3,
    AI_Q5: 4,
    PRELIM_1: -1,
    PRELIM_2: -1,
    PRELIM_3: -1,
    LOADING_AI_QUESTIONS: -1,
    LOADING_NARRATIVE: -1,
    REPORT: -1,
    ERROR: -1,
  };

  const isOnAi =
    step === "AI_Q1" ||
    step === "AI_Q2" ||
    step === "AI_Q3" ||
    step === "AI_Q4" ||
    step === "AI_Q5";

  const currentAiIndex = aiIndexMap[step];
  const currentQuestion: QuestionDef | null = isOnPrelim
    ? PRELIM_QUESTIONS[currentPrelimIndex]
    : isOnAi
      ? aiQuestions[currentAiIndex]
      : null;

  function resetSelectionForQuestion() {
    if (!currentQuestion) {
      setSelectedIndex(null);
      setOtherText("");
      return;
    }
    const existing =
      prelimAnswers.find((a) => a.id === currentQuestion.id) ||
      aiAnswers.find((a) => a.id === currentQuestion.id);
    if (existing) {
      setSelectedIndex(existing.choiceIndex);
      setOtherText(existing.choiceIndex === 6 ? existing.label : "");
    } else {
      setSelectedIndex(null);
      setOtherText("");
    }
  }

  React.useEffect(() => {
    resetSelectionForQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, JSON.stringify(currentQuestion?.id)]);

  // Typewriter effect for narrative
  React.useEffect(() => {
    if (narrative && step === "REPORT" && !displayedNarrative) {
      setIsTyping(true);
      let currentIndex = 0;
      const text = narrative;
      const typingSpeed = 20; // milliseconds per character

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedNarrative(text.substring(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeNextChar, typingSpeed);
        } else {
          setIsTyping(false);
        }
      };

      typeNextChar();
    } else if (step !== "REPORT") {
      // Reset when leaving report screen
      setDisplayedNarrative("");
      setIsTyping(false);
    }
  }, [narrative, step, displayedNarrative]);

  function handleKeypadPress(index: number) {
    if (pending) return;
    setSelectedIndex(index);
    if (index !== 6) setOtherText("");
  }

  function handleWhiteReset() {
    if (pending) return;
    if (window.confirm("Start over? All progress will be lost.")) {
      setStep("PRELIM_1");
      setPrelimAnswers([]);
      setAiQuestions([]);
      setAiAnswers([]);
      setSelectedIndex(null);
      setOtherText("");
      setScreenMessage(null);
      setNarrative("");
      setDisplayedNarrative("");
      setIsTyping(false);
      setErrorText(null);
    }
  }

  function handleRedBack() {
    if (pending) return;
    if (step === "PRELIM_2") setStep("PRELIM_1");
    else if (step === "PRELIM_3") setStep("PRELIM_2");
    else if (step === "AI_Q1") setStep("PRELIM_3");
    else if (step === "AI_Q2") setStep("AI_Q1");
    else if (step === "AI_Q3") setStep("AI_Q2");
    else if (step === "AI_Q4") setStep("AI_Q3");
    else if (step === "AI_Q5") setStep("AI_Q4");
  }

  const confirmEnabled = (() => {
    if (pending) return false;
    if (step === "LOADING_AI_QUESTIONS" || step === "LOADING_NARRATIVE")
      return false;
    if (step === "REPORT" || step === "ERROR") return false;
    if (selectedIndex == null) return false;
    if (selectedIndex === 6) return isValidOther(otherText);
    return true;
  })();

  const selectionDisabled =
    pending ||
    step === "LOADING_AI_QUESTIONS" ||
    step === "LOADING_NARRATIVE" ||
    step === "REPORT" ||
    step === "ERROR";

  function selectOption(idx: number) {
    if (selectionDisabled) return;
    handleKeypadPress(idx);
  }

  function persistAnswerForCurrent(): AnswerRecord | null {
    if (!currentQuestion || selectedIndex == null) return null;
    const qid = currentQuestion.id;
    const choice = selectedIndex;
    const label =
      choice === 6 ? otherText.trim() : currentQuestion.options[choice] ?? "";
    const rec: AnswerRecord = { id: qid, choiceIndex: choice, label };
    if (["Qp1", "Qp2", "Qp3"].includes(qid)) {
      setPrelimAnswers((prev) => [...prev.filter((a) => a.id !== qid), rec]);
    } else {
      setAiAnswers((prev) => [...prev.filter((a) => a.id !== qid), rec]);
    }
    return rec;
  }

  async function moveForward() {
    if (pending) return;
    if (
      step === "PRELIM_1" ||
      step === "PRELIM_2" ||
      step === "PRELIM_3" ||
      isOnAi
    ) {
      const saved = persistAnswerForCurrent();
      if (!saved) return;
    }

    if (step === "PRELIM_1") setStep("PRELIM_2");
    else if (step === "PRELIM_2") setStep("PRELIM_3");
    else if (step === "PRELIM_3") {
      setPending(true);
      setScreenMessage("Crafting personalized questions...");
      setStep("LOADING_AI_QUESTIONS");
      setErrorText(null);
      try {
        const resp = await postWithRetries<{
          questions: { id: string; question: string; options: string[] }[];
        }>("/api/devote/questions", { prelimAnswers });
        const mapped: QuestionDef[] = resp.questions.map((q) => ({
          id: q.id,
          title: q.question,
          options: q.options,
        }));
        setAiQuestions(mapped);
        setPending(false);
        setScreenMessage(null);
        setStep("AI_Q1");
      } catch (err) {
        console.error(err);
        setPending(false);
        setScreenMessage("We couldn't generate your questions right now.");
        setErrorText(
          "We couldn't generate tailored questions. Please refresh and try again."
        );
        setStep("ERROR");
      }
    } else if (step === "AI_Q1") setStep("AI_Q2");
    else if (step === "AI_Q2") setStep("AI_Q3");
    else if (step === "AI_Q3") setStep("AI_Q4");
    else if (step === "AI_Q4") setStep("AI_Q5");
    else if (step === "AI_Q5") {
      setPending(true);
      setScreenMessage("Assembling your strategic narrative...");
      setStep("LOADING_NARRATIVE");
      setErrorText(null);
      try {
        const resp = await postWithRetries<{ narrative: string }>(
          "/api/devote/narrative",
          { answers: allAnswers }
        );
        setNarrative(resp.narrative);
        setPending(false);
        setScreenMessage(null);
        setStep("REPORT");
      } catch (err) {
        console.error(err);
        setPending(false);
        setScreenMessage("We couldn't assemble your narrative right now.");
        setErrorText(
          "We couldn't assemble your narrative. Please try again later."
        );
        setStep("ERROR");
      }
    }
  }

  function handleCopyNarrative() {
    if (!narrative) return;
    navigator.clipboard.writeText(narrative).then(
      () => {
        setScreenMessage("Copied to clipboard.");
        setTimeout(() => setScreenMessage(null), 1500);
      },
      () => {
        setScreenMessage("Copy failed. Select and copy manually.");
        setTimeout(() => setScreenMessage(null), 3000);
      }
    );
  }

  
  return (
    <div className="app-container">
      <div className="machine-container">
        {/* Nixie tube hitboxes */}
        {nixieDigits.map((digit, idx) => (
          <div
            key={idx}
            className={`hitbox hb-nixie-${idx + 1}${
              digit != null ? " lit" : ""
            }`}
          >
            <span>{digit != null ? digit : "·"}</span>
          </div>
        ))}

        {/* Screen area hitbox */}
        <div className="hitbox hb-screen">
          {screenMessage && (
            <div className="status-message">{screenMessage}</div>
          )}

          {step === "ERROR" && errorText && (
            <div className="error-message">
              <p>{errorText}</p>
            </div>
          )}

          {step !== "REPORT" && currentQuestion && (
            <>
              <h1 className="question">{currentQuestion.title}</h1>
              <div className="options">
                {currentQuestion.options.map((opt, idx) => {
                  const selected = selectedIndex === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`option-button${
                        selected ? " selected" : ""
                      }`}
                      onClick={() => selectOption(idx)}
                      disabled={selectionDisabled}
                    >
                      <span className="option-number">{idx + 1}.</span>
                      <span className="option-text">{opt}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={`option-button${
                    selectedIndex === 6 ? " selected" : ""
                  }`}
                  onClick={() => selectOption(6)}
                  disabled={selectionDisabled}
                >
                  <span className="option-number">7.</span>
                  <span className="option-text">Other (type your own)</span>
                </button>
              </div>

              {selectedIndex === 6 && (
                <div className="custom-input">
                  <label>
                    Custom answer (5–50 chars):
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      maxLength={80}
                    />
                  </label>
                  {!isValidOther(otherText) && otherText.length > 0 && (
                    <div className="validation-error">
                      Keep it between 5 and 50 characters.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === "REPORT" && (
            <div className="report">
              <h1>Your DeVOTE pilot narrative</h1>
              <p className="hint">
                Press Button 1 to copy this text.
                {isTyping && <span className="typing-indicator"> ● Generating...</span>}
              </p>
              <div className="report-text">
                {(displayedNarrative || narrative).split("\n").map((p, i) => (
                  <p key={i} className={isTyping && i === (displayedNarrative || narrative).split("\n").length - 1 ? "typewriter-char" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keypad button hitboxes */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const isSelected = selectedIndex === idx;
          const disabled = selectionDisabled;
          const isCopyButton = step === "REPORT" && idx === 0;

          return (
            <button
              key={idx}
              className={`hitbox hb-key-${idx + 1}${
                isSelected ? " selected" : ""
              }${
                disabled && !isCopyButton ? " disabled" : ""
              }`}
              onClick={() => {
                if (isCopyButton) handleCopyNarrative();
                else if (!disabled) handleKeypadPress(idx);
              }}
              disabled={disabled && !isCopyButton}
              aria-label={`${idx + 1}`}
            >
              <span className="button-number">{idx + 1}</span>
            </button>
          );
        })}

        {/* Footer button hitboxes */}
        <button
          type="button"
          className="hitbox hb-reset"
          onClick={handleWhiteReset}
          disabled={
            pending ||
            step === "LOADING_AI_QUESTIONS" ||
            step === "LOADING_NARRATIVE"
          }
          aria-label="Reset"
        >
          Reset
        </button>
        <button
          type="button"
          className="hitbox hb-back"
          onClick={handleRedBack}
          disabled={
            pending ||
            step === "PRELIM_1" ||
            step === "LOADING_AI_QUESTIONS" ||
            step === "LOADING_NARRATIVE" ||
            step === "REPORT" ||
            step === "ERROR"
          }
          aria-label="Back"
        >
          Back
        </button>
        <button
          type="button"
          className="hitbox hb-confirm"
          onClick={confirmEnabled ? moveForward : undefined}
          disabled={!confirmEnabled}
          aria-label="Confirm"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
