
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from "firebase-admin/firestore";

// This function generates a URL-friendly slug from a filename
const createSlug = (fileName: string): string => {
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
    const cleanedName = nameWithoutExtension
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
  
    // The unique ID will come from the Firestore document ID now
    return extension ? `${cleanedName}.${extension}` : cleanedName;
};

// This handles the main POST request to get a pre-signed URL
export async function POST(request: Request) {
  const { filename, contentType, size, altText, dataAiHint } = await request.json();

  if (!filename || !contentType || !size) {
    return NextResponse.json({ error: "Filename, contentType, and size are required." }, { status: 400 });
  }

  // --- R2 Client Initialization ---
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    console.error("R2 environment variables are not fully set.");
    return NextResponse.json({ error: "Server configuration error: R2 environment variables are missing." }, { status: 500 });
  }

  try {
    const db = getAdminFirestore();
    // Create a new document in Firestore to get a unique ID
    const newFileRef = db.collection('media').doc();
    const fileId = newFileRef.id;

    const baseSlug = createSlug(filename);
    const uniqueSlug = `${fileId}-${baseSlug}`;


    const R2 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueSlug,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
    const finalUrl = `${publicUrl}/${uniqueSlug}`;
    
    // Save metadata to Firestore immediately
     await newFileRef.set({
      name: filename,
      type: contentType.split('/')[0] || 'file',
      url: finalUrl,
      size: size,
      altText: altText || '',
      dataAiHint: dataAiHint || '',
      uploadedAt: FieldValue.serverTimestamp(),
      modifiedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    });

    // Return the URLs and the unique ID for the client to use
    return NextResponse.json({ uploadUrl, finalUrl, fileId });

  } catch (error) {
    console.error("Error creating signed URL or saving metadata:", error);
    return NextResponse.json({ error: "Could not create upload URL or save metadata. Check server logs." }, { status: 500 });
  }
}

// This handles the CORS pre-flight OPTIONS request
export async function OPTIONS(request: Request) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { status: 204, headers });
}
