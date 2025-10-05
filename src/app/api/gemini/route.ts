import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY');
      return NextResponse.json({ error: 'Server not configured for Gemini. Set GEMINI_API_KEY.' }, { status: 500 });
    }
  const { text, targetRole, isChat, jobDescription, history } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    let prompt: string;
    
  if (isChat) {
      // Chat mode - comprehensive career guidance
      // Ensure oldest -> newest order if timestamps are provided
      let orderedHistory: any[] = Array.isArray(history) ? [...history] : [];
      try {
        orderedHistory.sort((a: any, b: any) => new Date(a.ts || 0).getTime() - new Date(b.ts || 0).getTime());
      } catch {}

      const historyBlock = orderedHistory.length
        ? `\nConversation history (most recent last):\n` + orderedHistory.map((h: any) => `- ${h.role}: ${h.text}`).join('\n') + '\n'
        : '';

      prompt = `You are an expert in career development and employability training.
Your goal is to help users grow professionally through actionable, personalized advice.
You specialize in five core areas:
1) Resume Writing Tips
2) Career Development Advice
3) Job Search Strategies
4) Interview Preparation
5) Skill Assessment


This is the conversation history:
${historyBlock}

This is user's question: ${text}


IMPORTANT: 
- Read the conversation history carefully and understand the user's question and provide better advice.
- If the user's question seems off-topic, vague, it might be understood after reading the conversation history.
- The user's question might be a follow-up question, so make sure to understand the context and provide better response.
- The vague, irrelevant, or off-topic question might be previously mentioned in the conversation history.

[STEP 1: CLASSIFY THE QUERY]
- Analyze the user's query and assign one or more categories from the five above.
- Use the conversation history to understand the user's question and accurately classify the question.
- If multiple categories apply (e.g., "resume for interview"), integrate them coherently.
- Please think carefully and thoroughly before deciding on the categories.
- If the user's query is not related to any of the five categories, return "General Career Support".
- If the user's query is clearly irrelevant to career development, say something to focus on career development, and stop the process.

[STEP 2: RESPOND BY CATEGORY]

— Resume Writing Tips —
- Provide comprehensive, recruiter-focused guidance (not generic). Use the user's query to tailor the advice to their specific situation.
- Emphasize: clarity, relevance to role, measurable impact, and ATS alignment.
- Cover pillars:
  * Content & Achievements: action verbs; quantify results; prioritize recent/relevant experiences.
  * Customization: tailor to JD and keywords (ATS-friendly).
  * Professional Tone: concise, confident; avoid filler and vague phrasing.
- Include at least one example bullet or mini-rewrite.
- Then ask targeted follow-ups to personalize:
  * Current level (first-year, final-year, early professional)?
  * Purpose (career fair, internship, scholarship, job, LinkedIn)?
  * Regional context (Singapore, U.S., global) and norms (ATS one-page vs multi-page CV)?
  * Specific role/company to tailor toward?

— Career Development Advice —
- Provide structured, realistic, motivating guidance for long-term growth.
- Include: self-assessment, SMART goals, skill-building plans, networking/mentorship, mindset habits.
- Optionally use frameworks (short-term vs long-term roadmap, Ikigai).
- Follow-ups:
  * Academic/professional level?
  * Short- and long-term goals?
  * Target industry/role?
  * Current challenges (clarity, direction, motivation, opportunity)?

— Job Search Strategies —
- Deliver practical, step-by-step tactics:
  * Platforms (LinkedIn, Glassdoor, Indeed, Handshake) and profile optimization.
  * Networking and referral outreach; tracking applications; follow-up messages.
  * Tailoring applications to JD; portfolio/GitHub/website where relevant.
- Follow-ups:
  * Target job/internship and function?
  * Region/country and openness to remote/hybrid?
  * LinkedIn/portfolio status?

— Interview Preparation —
- Provide structured prep for behavioral and/or technical/case/panel formats.
- Include: company/role research plan; STAR method; communication, confidence, body language; post-interview etiquette.
- Offer mock interview option.
- Follow-ups:
  * Interview type (behavioral, technical, case, panel)?
  * Company/industry?
  * Main need (confidence, structure, content)?
  * Want a timed mock simulation?

— Skill Assessment —
- Help users benchmark current skills vs target role using SWOT or skill-mapping (technical, soft, transferable).
- Recommend concrete resources (courses, certifications, projects).
- Follow-ups:
  * Target career path/role?
  * Strong vs weak skills today?
  * Relevant projects/internships/coursework completed?
  * Want a personalized upskilling plan?

[STEP 3: TONE & INTERACTION RULES]
- Be professional, encouraging, and conversational.
- Keep responses clear, structured, and actionable.
- If context is missing, ask 2-4 smart, concise follow-up questions before deep dives.

[OUTPUT FORMAT]
- Be conversational but professional — like a career coach who genuinely understands.
- Provide a structured answer with short sections/bullets.
- Make sure to show the overview of the answer in first few sentences before diving into the details.
- Include examples/templates where helpful.
- If needed, close with tailored follow-up questions and a concrete next step.
- Write in organized and well-structured paragraphs, have headings and subheadings.
- Use bullet points and numbered lists where appropriate.
- Use ONLY these formatting options that are supported:
  * Headers: # ## ### for different section levels
  * Bold text: **text** for emphasis
  * Italic text: *text* for emphasis
  * Bullet points: * item for lists
  * Numbered lists: 1. 2. 3. for step-by-step instructions
  * Line breaks for spacing between sections
- Do NOT use any other formatting (no emojis, no special characters, no unsupported markdown)
 - IMPORTANT: Do NOT include any thinking process, reasoning, labels, or classification statements in your response. Do not mention or reference the steps, the words "conversation history", or any meta like "Based on the conversation history". Start directly with helpful advice.
 - If the query is irrelevant to career development, respond with a short redirect only (no meta, no justification). For example:
   "Let's focus on career development. I can help with:\n\n* Resume writing tips\n* Career development advice\n* Job search strategies\n* Interview preparation\n* Skill assessment"
   Then stop.`;
    } else {
      // Resume analysis mode (strict JSON schema)
  const role = targetRole || 'professional';
      const schema = `{
  "skills": [{"name": string, "rating": number(1-10), "evidence": string}],
  "experience": [string],
  "summary": string,
  "gaps": [{"skill": string, "whyImportant": string, "howToLearn": string, "priority": number(1-3)}],
  "suggestions": [{"title": string, "description": string, "impact": number(1-3), "effort": number(1-3)}],
  "fit": {"score": number(1-10), "rationale": string},
  "tracks": [{"id": string, "title": string, "ctaUrl": string}]
}`;
  const jd = jobDescription ? `\nTarget job description to tailor analysis:\n${jobDescription}\n` : '';
  // few-shot style: demonstrate the format (concise) as an exemplar
  const exemplar = '{"skills":[{"name":"Python","rating":8,"evidence":"Built data pipelines"}],"experience":["2y data analytics"],"summary":"Strong analytics foundation." ,"gaps":[{"skill":"A/B testing","whyImportant":"Product roles require experimentation","howToLearn":"Run small experiments; read online course","priority":2}],"suggestions":[{"title":"Quantify impact","description":"Add metrics to bullet points","impact":3,"effort":1}],"fit":{"score":7,"rationale":"Relevant skills but missing experimentation"},"tracks":[{"id":"mentorship-basic","title":"1-1 CV + Mock Interview","ctaUrl":"https://calendly.com/your-mentor/intro"}] }';
  prompt = `You are an expert resume reviewer and career coach.
Analyze the following resume for the role of "${role}" and respond ONLY with minified JSON matching this schema:
${schema}

Guidelines:
- Be specific and tie skills/evidence to resume content when possible.
- Keep strings concise. Avoid markdown. Do not include any text outside JSON.
- Provide 2-4 items for gaps and suggestions. Provide 2-3 tracks.

Resume content:
${text}
${jd}

Use this exemplar for format ONLY (do not copy content):
${exemplar}`;
    }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Failed to analyze with Gemini AI' }, { status: 500 });
    }

    const data = await response.json();
    
    // Extract the text content from Gemini response
    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!geminiText) {
      return NextResponse.json({ error: 'Invalid response from Gemini AI' }, { status: 500 });
    }

  // Handle response based on mode
    let analysisResult;
    
    if (isChat) {
      // Chat mode - sanitize to remove any exposed "thinking" or meta lines
      const sanitizeChatText = (input: string): string => {
        if (!input) return input;
        const metaPatterns = [
          /^\s*\[?step\b.*\]?/i,
          /^\s*classification\s*:/i,
          /^\s*classify\s*:/i,
          /^\s*reason(?:ing)?\s*:/i,
          /^\s*thoughts?\s*:/i,
          /^\s*internal\s*:/i,
          /^\s*analysis\s*:/i,
          /^\s*meta\s*:/i,
          /^\s*plan\s*:/i,
          /^\s*based on the conversation history.*$/i,
          /^\s*from the conversation history.*$/i,
          /^\s*using the conversation history.*$/i,
          /^\s*the conversation history shows.*$/i,
        ];
        const lines = input.split('\n');
        const filtered: string[] = [];
        for (let i = 0; i < lines.length; i++) {
          const t = lines[i].trim();
          if (metaPatterns.some((rx) => rx.test(t))) continue;
          filtered.push(lines[i]);
        }
        while (filtered.length && filtered[0].trim() === '') filtered.shift();
        return filtered.join('\n').trim();
      };

      const cleaned = sanitizeChatText(geminiText);
      analysisResult = {
        description: cleaned,
        type: 'chat'
      };
    } else {
      // Resume analysis mode - try to parse JSON
      try {
        // Look for JSON content in the response
        const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create structured response from text
          analysisResult = {
            skills: [],
            experience: [],
            summary: "",
            gaps: [],
            suggestions: [],
            fit: { score: 7, rationale: "" },
            tracks: [
              { id: "career-dev", title: "Career Development Path", ctaUrl: "https://calendly.com/your-mentor" }
            ]
          };
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        // Fallback response
        analysisResult = {
          skills: [],
          experience: [],
          summary: "",
          gaps: [],
          suggestions: [],
          fit: { score: 7, rationale: "" },
          tracks: [
            { id: "career-dev", title: "Career Development Path", ctaUrl: "https://calendly.com/your-mentor" }
          ]
        };
      }
    }

    return NextResponse.json({
      success: true,
      result: analysisResult,
      rawGeminiResponse: geminiText
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
