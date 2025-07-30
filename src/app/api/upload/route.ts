
import { R2, bucketName, publicUrl } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Function to generate a URL-friendly slug from a filename
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


export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required." }, { status: 400 });
    }

    const slug = createSlug(filename);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: slug,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
    
    // The public URL that will be stored in the database
    const finalUrl = `${publicUrl}/${slug}`;

    return NextResponse.json({ uploadUrl: signedUrl, finalUrl: finalUrl });

  } catch (error) {
    console.error("Error creating signed URL:", error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `Failed to create signed URL: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred while creating signed URL." }, { status: 500 });
  }
}
