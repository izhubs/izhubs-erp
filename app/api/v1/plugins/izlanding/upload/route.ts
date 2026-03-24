import { NextResponse } from 'next/server';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return ApiResponse.error('No file uploaded', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with webp extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}.webp`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'landing');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    // Process image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true }) // limit max width
      .webp({ quality: 80 }) // compress to webp
      .toBuffer();

    // Save strictly to local disk for now
    await writeFile(join(uploadDir, filename), optimizedBuffer);

    const url = `/uploads/landing/${filename}`;
    
    return ApiResponse.success({ url, filename: file.name, size: optimizedBuffer.length });
  } catch (err) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izlanding/upload');
  }
});
