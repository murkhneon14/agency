import ImageKit from "imagekit";

/**
 * Returns an initialized ImageKit client instance.
 */
export function getImageKitClient() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit is not fully configured. Please set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in your environment.");
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

/**
 * Checks if ImageKit environment variables are configured.
 */
export function isImageKitConfigured() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;
  return Boolean(publicKey && privateKey && urlEndpoint);
}

/**
 * Generates authentication parameters for client-side direct uploads to ImageKit.
 */
export function getUploadAuthParameters() {
  const ik = getImageKitClient();
  return ik.getAuthenticationParameters();
}

/**
 * Generates a signed, expiring URL for private project files.
 * @param {string} filePath - Path of the file in ImageKit (e.g. /agency-projects/...)
 * @param {number} [expireSeconds=300] - URL validity in seconds (default: 5 minutes)
 */
export function getSignedFileUrl(filePath, expireSeconds = 300) {
  const ik = getImageKitClient();
  return ik.url({
    path: filePath,
    signed: true,
    expireSeconds,
  });
}
