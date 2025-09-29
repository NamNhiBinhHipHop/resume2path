import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory chat storage for demo purposes
const chatStorage = new Map<string, any[]>();

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, message } = await req.json();
    
    if (!userId || !sessionId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use in-memory storage for demo
    const chatKey = `${userId}-${sessionId}`;
    const existingMessages = chatStorage.get(chatKey) || [];
    existingMessages.push(message);
    chatStorage.set(chatKey, existingMessages);

    return NextResponse.json({ 
      success: true, 
      chatHistory: { userId, sessionId, messages: existingMessages }
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json({ error: 'Failed to save chat message' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    
    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Missing userId or sessionId' }, { status: 400 });
    }

    // Use in-memory storage for demo
    const chatKey = `${userId}-${sessionId}`;
    const messages = chatStorage.get(chatKey) || [];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    
    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Missing userId or sessionId' }, { status: 400 });
    }

    // Use in-memory storage for demo
    const chatKey = `${userId}-${sessionId}`;
    chatStorage.delete(chatKey);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return NextResponse.json({ error: 'Failed to delete chat history' }, { status: 500 });
  }
}
