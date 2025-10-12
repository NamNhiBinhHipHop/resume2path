export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { parseFileToText } from '@/lib/parse';
import { setAnalysis } from '@/lib/analysis-store';


export async function POST(req: Request) {
  try {
  const reqUrl = new URL(req.url);
  const debug = reqUrl.searchParams.get('debug') === '1';
    // Increase body size guard (40MB). Next.js limits apply, but we can pre-check file size.
    const form = await req.formData();
    const file = form.get('file') as File;
    const email = String(form.get('email')||'');
    const name = String(form.get('name')||'');
  const targetRole = String(form.get('targetRole')||'');
  const jobDescription = String(form.get('jobDescription')||'');
    
    if (!file || !email) {
      return NextResponse.json({ error: 'Missing file or email' }, { status: 400 });
    }

    // Validate file size (<= 40MB)
    const fileSize = (file as any).size as number | undefined;
    if (typeof fileSize === 'number' && fileSize > 40 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 40MB.' }, { status: 413 });
    }

    // Demo mode: Skip quota check and file storage
    console.log('Demo mode: Skipping quota check');
    console.log('Demo mode: Skipping file storage');
    const url = `demo://${crypto.randomUUID()}-${file.name}`;
    
  // Parse file to text (shared util)
  const parseRes = await parseFileToText(file);
  const text = parseRes.text || '';
  // Print full extracted text for verification
  console.log('\n[UPLOAD] Full extracted text for', file.name, '\n---\n' + text + '\n---\n');
  const textLen = text.length;
  console.log('[upload] extracted text length:', textLen, 'mime:', file.type, 'name:', file.name, 'parser:', parseRes.parser);

    // Demo mode: Skip database operations
    console.log('Demo mode: Skipping mentee operations');
    console.log('Demo mode: Skipping database insert');
    const menteeId = Math.floor(Math.random() * 1000);
    const resumeId = Math.floor(Math.random() * 1000);

    // Try Gemini AI analysis (non-chat) if configured; otherwise fall back to mock
    let finalResult: any = null;
    try {
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      if (hasGeminiKey && text.length > 0) {
        const aiRes = await fetch(`${reqUrl.origin}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetRole,
            jobDescription,
            isChat: false
          })
        });
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          finalResult = aiJson?.result || null;
          console.log('[upload] Gemini analysis completed');
          // Print Gemini response for verification
          try {
            if (aiJson?.rawGeminiResponse) {
              console.log('\n[UPLOAD] Gemini raw response (text)\n---\n' + aiJson.rawGeminiResponse + '\n---\n');
            }
            if (finalResult) {
              console.log('[UPLOAD] Gemini structured result (JSON):');
              console.log(JSON.stringify(finalResult, null, 2));
            }
          } catch {}
        } else {
          console.warn('[upload] Gemini call failed with status', aiRes.status);
        }
      } else {
        console.log('Gemini not configured or empty text; using mock analysis');
      }
    } catch (e) {
      console.warn('[upload] Gemini analysis error:', e);
    }

    // Demo mode: Generate mock analysis data
    console.log('Demo mode: Generating mock analysis data');
    const analysisId = Math.floor(Math.random() * 1000);
    
    const normalized = finalResult
      ? {
          // Prefer Gemini output but ensure role and parse metadata are present
          ...finalResult,
          role: (finalResult as any).role || targetRole || 'General',
          parse: (finalResult as any).parse || {
            parser: parseRes.parser,
            pages: parseRes.pages,
            textLength: textLen,
            file: { name: parseRes.name, mime: parseRes.mime, ext: parseRes.ext },
            error: parseRes.error,
          },
        }
      : {
      role: targetRole || 'General',
      skills: [
        { name: "JavaScript", rating: 8, evidence: "Listed in skills section" },
        { name: "React", rating: 7, evidence: "Mentioned in experience" },
        { name: "Node.js", rating: 6, evidence: "Backend development experience" },
        { name: "Python", rating: 5, evidence: "Basic knowledge mentioned" }
      ],
      experience: ["3+ years software development", "Full-stack web applications"],
      summary: "Experienced software developer with strong frontend skills and growing backend expertise. Shows good understanding of modern web technologies.",
      gaps: [
        {
          skill: "Cloud Computing (AWS/Azure)",
          whyImportant: "Essential for modern software deployment and scalability",
          howToLearn: "Take AWS certification courses, build projects on cloud platforms",
          priority: 2
        },
        {
          skill: "Testing Frameworks",
          whyImportant: "Ensures code quality and reduces bugs in production",
          howToLearn: "Learn Jest, Cypress, or similar testing tools",
          priority: 2
        },
        {
          skill: "System Design",
          whyImportant: "Required for senior developer roles and technical interviews",
          howToLearn: "Study distributed systems, practice system design interviews",
          priority: 3
        }
      ],
      suggestions: [
        {
          title: "Add Quantified Achievements",
          description: "Include specific metrics like 'Improved performance by 40%' or 'Reduced load time by 2 seconds'",
          impact: 3,
          effort: 1
        },
        {
          title: "Highlight Leadership Experience",
          description: "Mention any mentoring, team lead, or project management experience",
          impact: 2,
          effort: 2
        },
        {
          title: "Include Relevant Projects",
          description: "Add links to GitHub repositories or live project demos",
          impact: 3,
          effort: 2
        }
      ],
      fit: {
        score: 7,
        rationale: "Strong technical foundation with room for growth in cloud and testing areas"
      },
      tracks: [
        {
          id: "senior-developer-track",
          title: "Senior Developer Path",
          ctaUrl: "https://calendly.com/your-mentor/senior-dev"
        },
        {
          id: "full-stack-track",
          title: "Full-Stack Mastery",
          ctaUrl: "https://calendly.com/your-mentor/fullstack"
        }
      ],
      parse: {
        parser: parseRes.parser,
        pages: parseRes.pages,
        textLength: textLen,
        file: { name: parseRes.name, mime: parseRes.mime, ext: parseRes.ext },
        error: parseRes.error,
      }
    };

    // Store in-memory for the analysis-simple page to fetch
    setAnalysis(String(analysisId), {
      id: analysisId,
      result: normalized,
      createdAt: new Date().toISOString(),
      resume: {
        id: analysisId + 1000,
        fileUrl: url,
        fileType: file.type
      },
      mentee: {
        id: analysisId + 2000,
        name,
        email,
        targetRole: targetRole || 'General'
      }
    });

    // Demo mode: Skip all database operations
    console.log('Demo mode: Skipping all database operations');

    return NextResponse.json({ 
      analysisId: analysisId,
      redirectUrl: `/analysis-simple/${analysisId}`,
      analysis: normalized,
      ...(debug ? { textLength: text.length, fileType: file.type, fileName: file.name } : {})
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
