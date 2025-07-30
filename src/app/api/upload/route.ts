
import { R2, bucketName, publicUrl } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required." }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
    
    // The public URL that will be stored in the database
    const finalUrl = `${publicUrl}/${filename}`;

    return NextResponse.json({ uploadUrl: signedUrl, finalUrl: finalUrl });

  } catch (error) {
    console.error("Error creating signed URL:", error);
    return NextResponse.json({ error: "Failed to create signed URL." }, { status: 500 });
  }
}
