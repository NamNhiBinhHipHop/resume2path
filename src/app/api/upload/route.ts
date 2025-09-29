export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { parseFileToText } from '@/lib/parse';


export async function POST(req: Request) {
  try {
  const reqUrl = new URL(req.url);
  const debug = reqUrl.searchParams.get('debug') === '1';
    const form = await req.formData();
    const file = form.get('file') as File;
    const email = String(form.get('email')||'');
    const name = String(form.get('name')||'');
  const targetRole = String(form.get('targetRole')||'');
  const jobDescription = String(form.get('jobDescription')||'');
    
    if (!file || !email) {
      return NextResponse.json({ error: 'Missing file or email' }, { status: 400 });
    }

    // Demo mode: Skip quota check and file storage
    console.log('Demo mode: Skipping quota check');
    console.log('Demo mode: Skipping file storage');
    const url = `demo://${crypto.randomUUID()}-${file.name}`;
    
  // Parse file to text (shared util)
  const parseRes = await parseFileToText(file);
  const text = parseRes.text || '';
  const textLen = text.length;
  console.log('[upload] extracted text length:', textLen, 'mime:', file.type, 'name:', file.name, 'parser:', parseRes.parser);

    // Demo mode: Skip database operations
    console.log('Demo mode: Skipping mentee operations');
    console.log('Demo mode: Skipping database insert');
    const menteeId = Math.floor(Math.random() * 1000);
    const resumeId = Math.floor(Math.random() * 1000);

    // Demo mode: Skip Gemini AI call
    console.log('Demo mode: Skipping Gemini API call');
    let finalResult: any = null;

    // Demo mode: Generate mock analysis data
    console.log('Demo mode: Generating mock analysis data');
    const analysisId = Math.floor(Math.random() * 1000);
    
    const normalized = {
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

    // Demo mode: Skip all database operations
    console.log('Demo mode: Skipping all database operations');

    return NextResponse.json({ 
      analysisId: analysisId,
      redirectUrl: `/analysis-simple/${analysisId}`,
      ...(debug ? { textLength: text.length, fileType: file.type, fileName: file.name } : {})
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
