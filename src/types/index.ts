export type ImageStatus = "pending" | "processing" | "complete" | "error";

export interface ImageItem {
  id: string;
  originalPath: string;
  upscaledPath: string | null;
  status: ImageStatus;
  errorMessage?: string;
}
