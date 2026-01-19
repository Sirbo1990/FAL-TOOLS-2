import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { DropZone } from "./components/DropZone";
import { ComparisonCard } from "./components/ComparisonCard";
import { FullscreenModal } from "./components/FullscreenModal";
import { Slider } from "./components/Slider";
import type { ImageItem } from "./types";
import "./App.css";

function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [scaleFactor, setScaleFactor] = useState(2);
  const [creativity, setCreativity] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<ImageItem | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleFilesSelected = useCallback((paths: string[]) => {
    setImages((prev) => {
      const newImages = paths
        .filter((path) => !prev.some((img) => img.originalPath === path))
        .map((path) => ({
          id: generateId(),
          originalPath: path,
          upscaledPath: null,
          status: "pending" as const,
        }));

      if (newImages.length > 0) {
        setStatusMessage(`${prev.length + newImages.length} image(s) ready`);
        return [...prev, ...newImages];
      }
      return prev;
    });
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleUpscale = async () => {
    if (images.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: images.length });
    setStatusMessage("Processing...");

    let completed = 0;
    let errors = 0;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setProgress({ current: i + 1, total: images.length });

      // Update status to processing
      setImages((prev) =>
        prev.map((item) =>
          item.id === img.id ? { ...item, status: "processing" } : item
        )
      );

      try {
        // Call Tauri command to upscale - returns the output path
        const outputPath = await invoke<string>("upscale_image", {
          imagePath: img.originalPath,
          scaleFactor,
          creativity,
        });

        // Update status to complete with upscaled path
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? { ...item, status: "complete", upscaledPath: outputPath }
              : item
          )
        );
        completed++;
      } catch (error) {
        console.error(`Error processing ${img.originalPath}:`, error);
        // Update status to error
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  status: "error",
                  errorMessage: error instanceof Error ? error.message : String(error),
                }
              : item
          )
        );
        errors++;
      }
    }

    setIsProcessing(false);

    if (errors === 0) {
      setStatusMessage(`Complete! ${completed} image(s) upscaled`);
    } else {
      setStatusMessage(`Done with ${errors} error(s). ${completed}/${images.length} succeeded`);
    }
  };

  const progressPercent =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-7 h-7 text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
        </svg>
        <h1 className="text-2xl font-bold text-white">Crystal Upscaler</h1>
      </div>

      {/* Drop Zone */}
      <DropZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

      {/* Sliders */}
      <div className="w-full max-w-xl mt-6 space-y-4">
        <Slider
          label="Scale Factor"
          value={scaleFactor}
          min={1}
          max={200}
          onChange={setScaleFactor}
          color="blue"
        />
        <Slider
          label="Creativity"
          value={creativity}
          min={0}
          max={10}
          onChange={setCreativity}
          color="purple"
        />
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="w-full max-w-5xl mt-6 flex flex-wrap gap-4 justify-center">
          {images.map((img) => (
            <ComparisonCard
              key={img.id}
              image={img}
              onRemove={handleRemoveImage}
              onClick={() => {
                if (img.status === "complete" && img.upscaledPath) {
                  setFullscreenImage(img);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="w-full max-w-xl mt-6">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Processing {progress.current}/{progress.total}
          </p>
        </div>
      )}

      {/* Upscale Button */}
      <button
        onClick={handleUpscale}
        disabled={images.length === 0 || isProcessing}
        className={`
          mt-6 px-8 py-3 rounded-lg font-medium flex items-center gap-2
          transition-all duration-200
          ${
            images.length === 0 || isProcessing
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }
        `}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
            </svg>
            Upscale All
          </>
        )}
      </button>

      {/* Status Message */}
      {statusMessage && (
        <p
          className={`mt-4 text-sm ${
            statusMessage.includes("Complete")
              ? "text-green-400"
              : statusMessage.includes("error")
              ? "text-orange-400"
              : "text-gray-400"
          }`}
        >
          {statusMessage}
        </p>
      )}

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <FullscreenModal
          image={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  );
}

export default App;
