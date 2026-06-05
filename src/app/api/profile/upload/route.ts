import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    // Check file extension: pdf, doc, docx
    const ext = path.extname(file.name).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return NextResponse.json({ error: 'Only PDF, DOC, and DOCX files are allowed.' }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // already exists
    }

    const uniqueName = `${userPayload.userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save to disk
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueName}`;

    // Update profile in DB
    await db.profile.update({
      where: { userId: userPayload.userId },
      data: {
        resumeUrl: relativeUrl,
        resumeName: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      resumeUrl: relativeUrl,
      resumeName: file.name,
    });
  } catch (error: any) {
    console.error('Upload resume error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
