import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Demo mode: No database. This route intentionally does not access any DB.
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params; // await params to satisfy Next.js dynamic API requirement
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: 'Invalid analysis ID' }, { status: 400 });
  }
  // Redirect directly to the simple (demo) API to avoid DB and error overlays
  const target = new URL(`/api/analysis-simple/${idNum}`, request.url);
  return NextResponse.redirect(target, 307);
}

/*
// ORIGINAL DB IMPLEMENTATION (commented out per request; keep for reference)
// import { db } from '@/db';
// import { analyses, resumes, mentees } from '@/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const analysisId = parseInt(params.id);
//     if (isNaN(analysisId)) {
//       return NextResponse.json({ error: 'Invalid analysis ID' }, { status: 400 });
//     }
//     const analysis = await db
//       .select({
//         id: analyses.id,
//         result: analyses.result,
//         createdAt: analyses.createdAt,
//         resume: {
//           id: resumes.id,
//           fileUrl: resumes.fileUrl,
//           fileType: resumes.fileType,
//         },
//         mentee: {
//           id: mentees.id,
//           name: mentees.name,
//           email: mentees.email,
//           targetRole: mentees.targetRole,
//         }
//       })
//       .from(analyses)
//       .innerJoin(resumes, eq(analyses.resumeId, resumes.id))
//       .innerJoin(mentees, eq(resumes.menteeId, mentees.id))
//       .where(eq(analyses.id, analysisId))
//       .limit(1);
//     if (analysis.length === 0) {
//       return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
//     }
//     return NextResponse.json({ result: analysis[0] });
//   } catch (error) {
//     console.error('Error fetching analysis:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
*/

