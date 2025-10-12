import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/analysis-store';

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params; // Next.js (latest) requires awaiting params
    const analysisId = parseInt(id);

    if (isNaN(analysisId)) {
      return NextResponse.json({ error: 'Invalid analysis ID' }, { status: 400 });
    }

    // Try to return in-memory analysis if available
    const existing = getAnalysis(analysisId);
    if (existing) {
      return NextResponse.json({ result: existing });
    }

    // Demo mode: Generate mock analysis data
    console.log('Demo mode: Generating mock analysis data for ID:', analysisId);

    const mockAnalysis = {
      id: analysisId,
      result: {
        role: "Software Developer",
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
          parser: "demo",
          pages: 1,
          textLength: 500,
          file: { name: "resume.pdf", mime: "application/pdf", ext: "pdf" },
          error: null
        }
      },
      createdAt: new Date().toISOString(),
      resume: {
        id: analysisId + 1000,
        fileUrl: "demo://resume.pdf",
        fileType: "application/pdf"
      },
      mentee: {
        id: analysisId + 2000,
        name: "Demo User",
        email: "demo@example.com",
        targetRole: "Senior Developer"
      }
    };

    return NextResponse.json({ result: mockAnalysis });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
