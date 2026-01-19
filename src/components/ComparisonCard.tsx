import { convertFileSrc } from "@tauri-apps/api/core";
import { ComparisonSlider } from "./ComparisonSlider";
import type { ImageItem } from "../types";

interface ComparisonCardProps {
  image: ImageItem;
  onRemove: (id: string) => void;
  onClick: () => void;
}

export function ComparisonCard({ image, onRemove, onClick }: ComparisonCardProps) {
  const filename = image.originalPath.split("/").pop() || image.originalPath;
  const displayName = filename.length > 25 ? filename.slice(0, 22) + "..." : filename;
  const originalSrc = convertFileSrc(image.originalPath);

  const statusBadge = {
    pending: (
      <span className="px-2 py-0.5 bg-gray-600 text-gray-200 rounded text-xs">
        Pending
      </span>
    ),
    processing: (
      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs flex items-center gap-1">
        <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
        Processing
      </span>
    ),
    complete: (
      <span className="px-2 py-0.5 bg-green-600 text-white rounded text-xs">
        Complete
      </span>
    ),
    error: (
      <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs">
        Error
      </span>
    ),
  };

  return (
    <div className="relative w-[400px] bg-gray-800 rounded-xl overflow-hidden group">
      {/* Remove button - visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg
          className="w-4 h-4 text-white"
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

      {/* Image area */}
      <div
        className={`relative h-[280px] ${image.status === "complete" ? "cursor-pointer" : ""}`}
        onClick={image.status === "complete" ? onClick : undefined}
      >
        {image.status === "complete" && image.upscaledPath ? (
          <ComparisonSlider
            originalPath={image.originalPath}
            upscaledPath={image.upscaledPath}
            className="w-full h-full"
          />
        ) : (
          <>
            {/* Original image */}
            <img
              src={originalSrc}
              alt={filename}
              className="w-full h-full object-cover"
            />

            {/* Status overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {image.status === "pending" && (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">Waiting</span>
                </div>
              )}

              {image.status === "processing" && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-300 text-sm">Upscaling...</span>
                </div>
              )}

              {image.status === "error" && (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-12 h-12 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-red-300 text-sm">
                    {image.errorMessage || "Failed"}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer with filename and status */}
      <div className="px-3 py-2 flex items-center justify-between bg-gray-800">
        <span className="text-sm text-gray-300 truncate max-w-[280px]">
          {displayName}
        </span>
        {statusBadge[image.status]}
      </div>
    </div>
  );
}
