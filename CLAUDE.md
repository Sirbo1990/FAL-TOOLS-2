# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crystal Upscaler is a desktop application for AI-powered image upscaling using the FAL Crystal Upscaler model (`clarityai/crystal-upscaler`). Built with Tauri + React + TypeScript.

## Build and Run Commands

```bash
# Install dependencies
npm install
pip install -r python/requirements.txt

# Development (starts Vite + Tauri)
npm run tauri dev

# Build for production
npm run tauri build

# TypeScript check only
npm run build
```

## Architecture

**Three-layer architecture:**

1. **React Frontend** (`src/`) - UI with comparison gallery, drag-to-reveal slider
2. **Rust Backend** (`src-tauri/`) - Native desktop wrapper via Tauri, spawns Python process
3. **Python Worker** (`python/upscale.py`) - FAL API calls for actual AI upscaling

**Data flow:**
```
User drops image → React calls invoke("upscale_image") → Rust spawns Python subprocess
→ Python uploads to FAL CDN → FAL API processes → Python downloads result → saves _Upscaled.png
→ Returns path to Rust → Returns to React → ComparisonSlider displays before/after
```

**Key React components:**
- `ComparisonSlider.tsx` - Drag-to-reveal before/after comparison using CSS `clip-path`
- `ComparisonCard.tsx` - Gallery card showing status (pending/processing/complete/error)
- `FullscreenModal.tsx` - Large comparison view with ESC to close

**Tauri command** (`src-tauri/src/lib.rs`):
```rust
upscale_image(image_path: String, scale_factor: i32, creativity: i32) -> Result<String, String>
```
Returns the output file path on success.

## Configuration

Requires `python/.env` with:
```
FAL_KEY=<your-fal-api-key>
```

## Supported Formats

Input: JPG, JPEG, PNG, WebP
Output: PNG (saved next to original with `_Upscaled.png` suffix)
