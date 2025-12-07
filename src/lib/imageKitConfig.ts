import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.NEXT_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_IMAGEKIT_URL_ENDPOINT!,
});

export default imagekit;
