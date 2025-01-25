import type { PagesFunction } from '@cloudflare/workers-types';
import { Response } from '@cloudflare/workers-types';

interface R2Bucket {
    put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
}

interface Env {
    FILE_BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const formData = await context.request.formData();
        const file = formData.get('file') as unknown as File;

        if (!file) {
            return new Response('No file uploaded', { status: 400 });
        }

        const key = `${Date.now()}-${file.name}`;

        await context.env.FILE_BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: {
              contentType: file.type,
            },
          });

        return new Response(JSON.stringify({ success: true, key }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Upload failed:', error);
        return new Response('Upload failed', { status: 500 });
    }
};