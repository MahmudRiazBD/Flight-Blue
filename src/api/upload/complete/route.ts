
import { getAdminFirestore } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const db = getAdminFirestore();
    const { id, name, type, url, size, altText, dataAiHint } = await request.json();

    if (!id || !name || !type || !url || !size) {
      return NextResponse.json({ error: 'Missing required file metadata.' }, { status: 400 });
    }

    const docRef = db.collection('media').doc(id);

    await docRef.set({
      name,
      type,
      url,
      size,
      altText: altText || '',
      dataAiHint: dataAiHint || '',
      uploadedAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
      deletedAt: null,
    });

    return NextResponse.json({ success: true, message: 'Metadata saved successfully.' });
  } catch (error) {
    console.error('Error saving metadata to Firestore:', error);
    return NextResponse.json({ error: 'Failed to save metadata.' }, { status: 500 });
  }
}
