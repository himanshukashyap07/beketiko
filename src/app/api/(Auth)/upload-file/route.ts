import ImageKit from 'imagekit';
import apiResponse from '@/utils/apirespone';
import apiError from '@/utils/apiError';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.NEXT_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return apiError("no file provided",400)
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
    });
    return apiResponse(uploadResponse.url,200)
  } catch (error: any) {
    return apiError("interl server error in sending message",500)
  }
}
