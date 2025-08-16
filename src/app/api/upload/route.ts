import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

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
  
    const uniqueId = Date.now().toString(36).slice(-4);
  
    // Ensure the extension is not empty before adding the dot
    return extension ? `${cleanedName}-${uniqueId}.${extension}` : `${cleanedName}-${uniqueId}`;
};

// This handles the main POST request to get a pre-signed URL
export async function POST(request: Request) {
  const { filename, contentType } = await request.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Filename and contentType are required." }, { status: 400 });
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
    const R2 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const slug = createSlug(filename);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: slug,
      // ACL: 'public-read', // This is often not needed if bucket is public
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
    const finalUrl = `${publicUrl}/${slug}`;

    return NextResponse.json({ uploadUrl, finalUrl });

  } catch (error) {
    console.error("Error creating signed URL:", error);
    return NextResponse.json({ error: "Could not create upload URL. Check server logs." }, { status: 500 });
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
