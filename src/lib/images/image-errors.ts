export class UnsupportedImageTypeError extends Error {
  constructor() {
    super("unsupported-type");
    this.name = "UnsupportedImageTypeError";
  }
}

/** User-facing message for any failure while processing an image. */
export function describeImageError(error: unknown): string {
  return error instanceof UnsupportedImageTypeError
    ? "That file type isn't supported — try a JPG, PNG, or WEBP image."
    : "Couldn't process that image — please try another file.";
}
