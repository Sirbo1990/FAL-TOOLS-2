import { useEffect, useCallback } from "react";
import { ComparisonSlider } from "./ComparisonSlider";
import type { ImageItem } from "../types";

interface FullscreenModalProps {
  image: ImageItem;
  onClose: () => void;
}

export function FullscreenModal({ image, onClose }: FullscreenModalProps) {
  const filename = image.originalPath.split("/").pop() || image.originalPath;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!image.upscaledPath) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Header with filename and close button */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
        <h2 className="text-white text-lg font-medium truncate max-w-[80%]">
          {filename}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Large comparison slider */}
      <div
        className="w-[90vw] h-[80vh] rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <ComparisonSlider
          originalPath={image.originalPath}
          upscaledPath={image.upscaledPath}
          className="w-full h-full"
        />
      </div>

      {/* Hint text */}
      <p className="text-gray-400 text-sm mt-4">
        Drag to compare &bull; Press ESC or click outside to close
      </p>
    </div>
  );
}
