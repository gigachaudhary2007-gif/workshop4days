import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy GoogleGenAI client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. Doubt Solver Endpoint (Connects to Gemini securely on the server)
app.post("/api/doubt/solve", async (req, res) => {
  try {
    const { question, subject, imageBase64, imageMimeType, documentText, userId } = req.body;

    const hasQuestion = typeof question === "string" && question.trim().length > 0;
    const hasImage = typeof imageBase64 === "string" && imageBase64.length > 0;
    const hasDoc = typeof documentText === "string" && documentText.trim().length > 0;

    if (!hasQuestion && !hasImage && !hasDoc) {
      return res.status(400).json({ error: "Please provide a question, an image, or study material to solve." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // High-quality contextual pedagogical fallback if GEMINI_API_KEY is not configured
      return res.json({
        mainContext: `Academic guidance for ${subject || "General Academic"} on "${question || "Uploaded Problem Diagram"}": Review fundamental definitions and identify core governing theorems.`,
        mainPoints: [
          "Identify all given variables, constants, and known conditions.",
          "Apply the standard theorem or formula directly to the unknown target.",
          "Check intermediate algebraic calculations and dimensional units.",
          "Verify that the final result satisfies boundary and edge constraints."
        ],
        stepByStepSolution: [
          {
            stepNumber: 1,
            title: "Problem Deconstruction & Given Parameters",
            explanation: `Analyzing the problem (${question || "the attached question"}), we first list given parameters and isolate what needs to be determined.`,
            mathOrCode: "Given: known parameters -> Target: required unknown"
          },
          {
            stepNumber: 2,
            title: "Governing Formula & Principle Application",
            explanation: "Apply the standard curriculum formula connecting the known values to the target unknown.",
            mathOrCode: "Principle: Standard curriculum theorem"
          },
          {
            stepNumber: 3,
            title: "Substitution & Systematic Calculation",
            explanation: "Substitute the numerical or symbolic values into the formula and solve step-by-step.",
            mathOrCode: "Result derived via step-by-step algebraic simplification"
          }
        ],
        finalAnswer: `The systematic solution for "${question || "this doubt"}" is derived using core curriculum principles.`,
        quickSummary: "Identify knowns and unknowns, apply standard formulas, verify units, and review intermediate steps."
      });
    }

    const contents: any[] = [];

    // Process image if uploaded (multimodal Gemini input)
    if (hasImage) {
      let detectedMime = imageMimeType;
      if (!detectedMime && imageBase64.startsWith("data:")) {
        const match = imageBase64.match(/^data:([^;]+);base64,/);
        if (match) {
          detectedMime = match[1];
        }
      }
      detectedMime = detectedMime || "image/jpeg";

      const cleanBase64 = imageBase64
        .replace(/^data:[a-zA-Z0-9\/\+\-]+;base64,/, "")
        .trim();

      if (cleanBase64) {
        contents.push({
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64,
          },
        });
      }
    }

    // Pedagogical Socratic prompt for Gemini
    const promptText = `You are "Study to Shine", an expert, friendly, and pedagogically brilliant student mentor and tutor.
A student has asked a doubt. Please provide an easy-to-understand, encouraging, highly structured response for this student.

Subject/Topic: ${subject || "General Academic"}
${hasQuestion ? `Student's Question: ${question.trim()}` : ""}
${hasImage ? `\n[Image Attached]: The student uploaded an image of their academic question or textbook problem. Carefully examine all text, equations, diagrams, labels, and handwriting in the image, determine the exact problem, and explain and solve it completely.` : ""}
${hasDoc ? `\nAttached Document Excerpt:\n${documentText.trim()}\n` : ""}

You MUST respond strictly with a valid JSON object matching this structure:
{
  "mainContext": "A clear, encouraging 2-3 sentence overview explaining the background and what this question is fundamentally asking.",
  "mainPoints": ["Point 1: Key concept identified", "Point 2: Core theorem or rule applied", "Point 3: Common pitfall to avoid"],
  "stepByStepSolution": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "explanation": "Clear, friendly student explanation of this step.",
      "mathOrCode": "Optional mathematical formula, equation, or code snippet"
    }
  ],
  "finalAnswer": "The precise, definitive final answer or conclusion highlighted cleanly for the student.",
  "quickSummary": "A concise 2-sentence summary / takeaway rule for quick revision before exams."
}
`;

    contents.push({ text: promptText });

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainContext: { type: Type.STRING },
          mainPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          stepByStepSolution: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                mathOrCode: { type: Type.STRING },
              },
              required: ["stepNumber", "title", "explanation"],
            },
          },
          finalAnswer: { type: Type.STRING },
          quickSummary: { type: Type.STRING },
        },
        required: [
          "mainContext",
          "mainPoints",
          "stepByStepSolution",
          "finalAnswer",
          "quickSummary",
        ],
      },
    };

    // Resilient model cascade: try primary gemini-3.8-flash -> gemini-flash-latest -> gemini-3.1-flash-lite
    const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let responseText = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts: contents },
          config: generationConfig,
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} request did not complete, trying next model in cascade:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw new Error(lastError?.message || "Empty response received from Gemini.");
    }

    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse JSON response from Gemini.");
      }
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("Error solving doubt:", error);
    res.status(500).json({
      error: "Failed to generate AI doubt solution. Please try again.",
      details: error?.message || String(error),
    });
  }
});

// 2. AI Notes Analyzer Endpoint
app.post("/api/notes/analyze", async (req, res) => {
  try {
    const { title, rawNotes, subject, imageBase64, imageMimeType } = req.body;

    const hasNotes = typeof rawNotes === "string" && rawNotes.trim().length > 0;
    const hasImage = typeof imageBase64 === "string" && imageBase64.length > 0;

    if (!hasNotes && !hasImage) {
      return res.status(400).json({ error: "Please enter study notes or upload handwritten notes/document." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback structured study guide if GEMINI_API_KEY is not configured
      return res.json({
        topic: title || "Comprehensive Study Notes",
        explanation: `This study guide summarizes the core foundational knowledge for ${subject || "Academic Study"} based on the provided notes and materials, focusing on clear conceptual understanding and high-yield revision.`,
        importantConcepts: [
          { concept: "Core Foundation", description: "Fundamental axioms, principles, and definitions establishing this topic." },
          { concept: "Operational Framework", description: "How various variables, physical quantities, and theoretical components interact." }
        ],
        definitions: [
          { term: "Fundamental Concept", definition: "A standard academic unit of analysis or governing conceptual principle." },
          { term: "Equilibrium Condition", definition: "A state in which opposing forces, reaction rates, or influences are balanced." }
        ],
        formulas: [
          { name: "Primary Governing Relation", formula: "f(x) = ∑ a_n · x^n", explanation: "Describes the overarching relationship across the studied domain." }
        ],
        keyPoints: [
          "Always verify prerequisites and units before applying advanced equations.",
          "Identify boundary constraints early in problem formulation.",
          "Structure diagrams with explicit vector, state, or chemical designations."
        ],
        examples: [
          { problem: "Sample Application Problem: Calculate output given initial conditions.", solution: "Apply the governing formula directly, simplify algebraic terms, and verify units." }
        ],
        importantQuestions: [
          { question: "What is the primary difference between theoretical equilibrium and steady-state?", hint: "Focus on whether external work or energy flux is continuous.", answer: "Equilibrium requires no net exchange or entropy generation, whereas steady-state maintains constant parameters via continuous energy throughput." }
        ],
        quickRevision: [
          "Topic Mastery: Memorize the core governing definitions.",
          "Exam Tip: Watch out for sign conventions and dimensional consistency.",
          "Quick Check: Review all bolded terms before tests."
        ]
      });
    }

    const contents: any[] = [];

    // Process image if uploaded (multimodal Gemini input for handwritten notes)
    if (hasImage) {
      let detectedMime = imageMimeType;
      if (!detectedMime && imageBase64.startsWith("data:")) {
        const match = imageBase64.match(/^data:([^;]+);base64,/);
        if (match) {
          detectedMime = match[1];
        }
      }
      detectedMime = detectedMime || "image/jpeg";

      const cleanBase64 = imageBase64
        .replace(/^data:[a-zA-Z0-9\/\+\-]+;base64,/, "")
        .trim();

      if (cleanBase64) {
        contents.push({
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64,
          },
        });
      }
    }

    const promptText = `You are "Study to Shine" Note Architect and Master Academic Tutor.
Analyze the provided handwritten notes, textbook photos, study transcript, or document, and organize it into a pristine, high-yield, pedagogically structured study document.

Subject: ${subject || "General Academic"}
Topic/Title: ${title || "Study Material"}
${hasNotes ? `Notes Content / Excerpt:\n${rawNotes.trim()}\n` : ""}
${hasImage ? `[Handwritten Notes / Document Attached]: Carefully read and transcribe all handwritten text, diagrams, labels, and formulas from the student's uploaded image. Extract and synthesize the study material with high accuracy.` : ""}

Generate a comprehensive, student-friendly response with:
1. topic: A clear, descriptive subject topic title.
2. explanation: A simple, intuitive explanation of the entire topic in plain, encouraging language suitable for high school / college exam prep.
3. importantConcepts: An array of { concept, description } explaining each key theoretical mechanism.
4. definitions: An array of { term, definition } defining key terminology.
5. formulas: An array of { name, formula, explanation }. If the topic is purely conceptual or non-mathematical, provide standard relevant relations or leave as an empty array [].
6. keyPoints: An array of string bullet points capturing essential takeaways and exam alerts.
7. examples: An array of { problem, solution } demonstrating practical applications.
8. importantQuestions: An array of { question, hint, answer } for active-recall practice.
9. quickRevision: An array of concise revision points for a 5-minute pre-exam review.

Respond strictly with valid JSON.`;

    contents.push({ text: promptText });

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          explanation: { type: Type.STRING },
          importantConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                concept: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["concept", "description"],
            },
          },
          definitions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ["term", "definition"],
            },
          },
          formulas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                formula: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["name", "formula", "explanation"],
            },
          },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                solution: { type: Type.STRING },
              },
              required: ["problem", "solution"],
            },
          },
          importantQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ["question", "hint", "answer"],
            },
          },
          quickRevision: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "topic",
          "explanation",
          "importantConcepts",
          "definitions",
          "formulas",
          "keyPoints",
          "examples",
          "importantQuestions",
          "quickRevision",
        ],
      },
    };

    // Resilient model cascade
    const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let responseText = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts: contents },
          config: generationConfig,
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} request did not complete, trying next model in cascade:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw new Error(lastError?.message || "Empty response received from Gemini.");
    }

    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse JSON response from Gemini.");
      }
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("Error analyzing notes:", error);
    res.status(500).json({
      error: "Failed to analyze notes. Please try again.",
      details: error?.message || String(error),
    });
  }
});

// 3. AI Graph / Visual Explanation Generator for My Notes
app.post("/api/notes/generate-visual", async (req, res) => {
  try {
    const { noteTitle, content, visualType } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: noteTitle || "Concept Visual Map",
        type: visualType || "concept_map",
        description: "Visual relationship map illustrating core nodes and linkages.",
        nodes: [
          { id: "1", label: noteTitle || "Core Topic", category: "primary", x: 250, y: 150 },
          { id: "2", label: "Fundamental Principle", category: "concept", x: 120, y: 260 },
          { id: "3", label: "Application & Formula", category: "formula", x: 380, y: 260 },
          { id: "4", label: "Real-World Outcome", category: "outcome", x: 250, y: 360 }
        ],
        links: [
          { from: "1", to: "2", label: "defined by" },
          { from: "1", to: "3", label: "governed through" },
          { from: "2", to: "4", label: "enables" },
          { from: "3", to: "4", label: "produces" }
        ],
        keyTakeaway: "All elements converge from the central foundation to practical applications."
      });
    }

    const promptText = `You are a visual learning specialist for Study to Shine.
Convert the following student note into a clean, educational visual concept graph:
Title: ${noteTitle}
Content: ${content}

Return JSON with:
- title: string
- type: "concept_map" | "flowchart" | "comparison"
- description: short explanation of how to interpret this visual
- nodes: array of { id, label, category: "primary" | "concept" | "formula" | "outcome", x, y } (coordinates x from 60 to 480, y from 60 to 380)
- links: array of { from: node_id, to: node_id, label: string }
- keyTakeaway: single sentence visual summary`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  category: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                },
                required: ["id", "label", "category", "x", "y"],
              },
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  from: { type: Type.STRING },
                  to: { type: Type.STRING },
                  label: { type: Type.STRING },
                },
                required: ["from", "to", "label"],
              },
            },
            keyTakeaway: { type: Type.STRING },
          },
          required: ["title", "type", "description", "nodes", "links", "keyTakeaway"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error generating visual graph:", error);
    res.status(500).json({
      error: "Failed to generate visual graph.",
      details: error?.message || String(error),
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study to Shine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
