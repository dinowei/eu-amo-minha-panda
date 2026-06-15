from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageOps


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_WIDTH = 1920
THUMB_WIDTH = 400
WEBP_QUALITY = 80
AUDIO_BITRATE = "96k"


def format_bytes(num_bytes: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    size = float(num_bytes)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{num_bytes} B"


def resize_to_width(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image.copy()

    ratio = max_width / image.width
    height = round(image.height * ratio)
    return image.resize((max_width, height), Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(
        destination,
        format="WEBP",
        quality=WEBP_QUALITY,
        method=6,
    )


def optimize_images(images_dir: Path) -> list[tuple[str, int, int, int]]:
    results: list[tuple[str, int, int, int]] = []

    for source in sorted(images_dir.iterdir()):
        if source.suffix.lower() not in IMAGE_EXTENSIONS or not source.is_file():
            continue

        full_output = source.with_suffix(".webp")
        thumb_output = source.with_suffix(".thumb.webp")

        with Image.open(source) as original_image:
            prepared = ImageOps.exif_transpose(original_image)
            color_safe = prepared.convert("RGB")

            full_image = resize_to_width(color_safe, MAX_WIDTH)
            thumb_image = resize_to_width(color_safe, THUMB_WIDTH)

            save_webp(full_image, full_output)
            save_webp(thumb_image, thumb_output)

        before_size = source.stat().st_size
        full_size = full_output.stat().st_size
        thumb_size = thumb_output.stat().st_size
        results.append((source.name, before_size, full_size, thumb_size))

    return results


def detect_ffmpeg() -> Path | None:
    discovered = shutil.which("ffmpeg")
    if discovered:
        return Path(discovered)

    local_app_data = Path.home() / "AppData" / "Local"
    winget_dir = (
        local_app_data
        / "Microsoft"
        / "WinGet"
        / "Packages"
        / "Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe"
    )
    direct_candidate = winget_dir / "ffmpeg-8.1.1-essentials_build" / "bin" / "ffmpeg.exe"
    if direct_candidate.exists():
        return direct_candidate

    if winget_dir.exists():
        matches = sorted(winget_dir.glob("**/ffmpeg.exe"))
        if matches:
            return matches[0]

    return None


def compress_audio(audio_path: Path) -> tuple[int, int] | None:
    ffmpeg_path = detect_ffmpeg()
    if not ffmpeg_path or not audio_path.exists():
        return None

    temp_output = audio_path.with_suffix(".optimized.tmp.mp3")
    command = [
        str(ffmpeg_path),
        "-y",
        "-i",
        str(audio_path),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        AUDIO_BITRATE,
        str(temp_output),
    ]
    subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    before_size = audio_path.stat().st_size
    after_size = temp_output.stat().st_size

    if after_size < before_size:
        temp_output.replace(audio_path)
    else:
        temp_output.unlink(missing_ok=True)
        after_size = before_size

    return before_size, after_size


def print_image_report(results: list[tuple[str, int, int, int]]) -> None:
    total_before = sum(item[1] for item in results)
    total_full = sum(item[2] for item in results)
    total_thumbs = sum(item[3] for item in results)

    for name, before_size, full_size, thumb_size in results:
        print(
            f"{name}: {format_bytes(before_size)} -> "
            f"{format_bytes(full_size)} (webp), {format_bytes(thumb_size)} (thumb)"
        )

    print(
        "\nImages total: "
        f"{format_bytes(total_before)} -> {format_bytes(total_full)} full + "
        f"{format_bytes(total_thumbs)} thumbs"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Optimize frontend images for web and optionally compress the MP3."
    )
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=Path("frontend/imagens"),
        help="Directory containing source images.",
    )
    parser.add_argument(
        "--audio-path",
        type=Path,
        default=Path("frontend/musica.mp3"),
        help="Audio file to recompress with ffmpeg if available.",
    )
    parser.add_argument(
        "--skip-audio",
        action="store_true",
        help="Skip MP3 recompression.",
    )
    args = parser.parse_args()

    image_results = optimize_images(args.images_dir)
    print_image_report(image_results)

    if args.skip_audio:
        return

    audio_result = compress_audio(args.audio_path)
    if not audio_result:
        print("\nAudio: ffmpeg not found or audio file missing; skipped.")
        return

    before_size, after_size = audio_result
    print(f"Audio: {format_bytes(before_size)} -> {format_bytes(after_size)}")


if __name__ == "__main__":
    main()
