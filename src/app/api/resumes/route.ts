import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory resume storage for demo purposes
const resumeStorage = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const resumeData = await req.json();
    
    if (!resumeData.userId || !resumeData.fileName || !resumeData.fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use in-memory storage for demo
    const resumeId = Math.random().toString(36).substr(2, 9);
    const resume = { id: resumeId, ...resumeData, createdAt: new Date() };
    resumeStorage.set(resumeId, resume);

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Use in-memory storage for demo
    const resumes = Array.from(resumeStorage.values())
      .filter(resume => resume.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { resumeId, updateData } = await req.json();
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Missing resumeId' }, { status: 400 });
    }

    // Use in-memory storage for demo
    const existingResume = resumeStorage.get(resumeId);
    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const updatedResume = { ...existingResume, ...updateData };
    resumeStorage.set(resumeId, updatedResume);

    return NextResponse.json({ success: true, resume: updatedResume });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Missing resumeId' }, { status: 400 });
    }

    // Use in-memory storage for demo
    resumeStorage.delete(resumeId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
