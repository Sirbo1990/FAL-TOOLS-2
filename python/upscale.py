#!/usr/bin/env python3
"""
Crystal Upscaler - Python backend for FAL API calls.
Called by Tauri to upscale images.

Usage: python upscale.py <image_path> <scale_factor> <creativity>
"""

import os
import sys
from pathlib import Path

# Load environment from .env file
def load_env():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key] = value

load_env()

import fal_client
import requests


def upscale_image(image_path: str, scale_factor: int, creativity: int) -> str:
    """
    Upscale an image using FAL Crystal Upscaler.

    Args:
        image_path: Path to the input image
        scale_factor: Scale factor (1-200)
        creativity: Creativity level (0-10)

    Returns:
        Path to the output image
    """
    # Read and upload image to FAL CDN
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Determine content type
    ext = os.path.splitext(image_path)[1].lower()
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    content_type = content_types.get(ext, "image/png")

    # Upload to FAL CDN
    image_url = fal_client.upload(image_bytes, content_type=content_type)

    # Run upscaler
    result = fal_client.subscribe(
        "clarityai/crystal-upscaler",
        arguments={
            "image_url": image_url,
            "scale_factor": scale_factor,
            "creativity": creativity,
        },
        with_logs=True,
    )

    # Download the output image
    if result and "images" in result and len(result["images"]) > 0:
        output_url = result["images"][0]["url"]
        response = requests.get(output_url)
        response.raise_for_status()

        # Save next to original with _Upscaled suffix
        path = Path(image_path)
        output_path = path.parent / f"{path.stem}_Upscaled.png"

        with open(output_path, "wb") as f:
            f.write(response.content)

        return str(output_path)

    raise Exception("No output image returned from API")


def main():
    if len(sys.argv) != 4:
        print("Usage: python upscale.py <image_path> <scale_factor> <creativity>", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    scale_factor = int(sys.argv[2])
    creativity = int(sys.argv[3])

    # Check FAL_KEY
    if not os.environ.get("FAL_KEY"):
        print("Error: FAL_KEY not set in environment", file=sys.stderr)
        sys.exit(1)

    try:
        output_path = upscale_image(image_path, scale_factor, creativity)
        print(output_path)  # Output the result path
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
