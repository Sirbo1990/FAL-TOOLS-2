import { useState, useCallback, useEffect, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWebview } from "@tauri-apps/api/webview";

interface DropZoneProps {
  onFilesSelected: (paths: string[]) => void;
  disabled?: boolean;
}

const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export function DropZone({ onFilesSelected, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const onFilesSelectedRef = useRef(onFilesSelected);

  // Keep ref updated
  useEffect(() => {
    onFilesSelectedRef.current = onFilesSelected;
  }, [onFilesSelected]);

  // Listen for file drops from Tauri using the correct Tauri 2 API
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await getCurrentWebview().onDragDropEvent((event) => {
          if (event.payload.type === 'over') {
            setIsDragging(true);
          } else if (event.payload.type === 'drop') {
            setIsDragging(false);
            const paths = event.payload.paths.filter((path) => {
              const ext = path.split(".").pop()?.toLowerCase();
              return ext && SUPPORTED_EXTENSIONS.includes(ext);
            });
            if (paths.length > 0) {
              onFilesSelectedRef.current(paths);
            }
          } else {
            // cancelled
            setIsDragging(false);
          }
        });
      } catch (err) {
        console.error("Failed to setup drag-drop listener:", err);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (disabled) return;

    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Images",
          extensions: SUPPORTED_EXTENSIONS,
        },
      ],
    });

    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      onFilesSelected(paths);
    }
  }, [onFilesSelected, disabled]);

  return (
    <div
      onClick={handleClick}
      className={`
        w-full max-w-xl h-40 rounded-xl border-2 border-dashed
        flex flex-col items-center justify-center gap-2
        cursor-pointer transition-all duration-200
        ${
          isDragging
            ? "border-blue-400 bg-blue-900/30"
            : "border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-gray-800"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <svg
        className={`w-12 h-12 ${isDragging ? "text-blue-400" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className={`text-base ${isDragging ? "text-blue-400" : "text-gray-400"}`}>
        Drop images here
      </p>
      <p className="text-sm text-gray-500">or click to browse</p>
    </div>
  );
}
