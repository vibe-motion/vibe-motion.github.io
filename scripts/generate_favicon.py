#!/usr/local/bin/python3
"""Generate the Vibe Motion favicon as an antialiased PNG."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


CANVAS_SIZE = 512
SUPERSAMPLE = 4


def scaled_box(box: tuple[int, int, int, int], scale: int) -> tuple[int, int, int, int]:
    return tuple(value * scale for value in box)


def generate_favicon(output: Path, size: int = CANVAS_SIZE) -> None:
    """Render the rounded background and three onion-skin animation frames."""
    scale = SUPERSAMPLE
    render_size = CANVAS_SIZE * scale

    # The transparent canvas leaves genuinely rounded outer corners in the PNG.
    image = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle(
        (0, 0, render_size - 1, render_size - 1),
        radius=72 * scale,
        fill=(0, 0, 0, 255),
    )

    radius = 104
    # Draw the same purple back to front at increasing opacity. The translucent
    # trailing frames create the familiar onion-skin overlap.
    frames = (
        ((174, 338), (168, 85, 247, 64)),
        ((256, 256), (168, 85, 247, 170)),
        ((338, 174), (168, 85, 247, 255)),
    )
    for (center_x, center_y), color in frames:
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        layer_draw = ImageDraw.Draw(layer, "RGBA")
        circle = (
            center_x - radius,
            center_y - radius,
            center_x + radius,
            center_y + radius,
        )
        layer_draw.ellipse(scaled_box(circle, scale), fill=color)
        image = Image.alpha_composite(image, layer)

    image = image.resize((size, size), Image.Resampling.LANCZOS)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, "PNG", optimize=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "favicon.png",
        help="Output PNG path (default: project-root/favicon.png)",
    )
    parser.add_argument(
        "--size",
        type=int,
        default=CANVAS_SIZE,
        help=f"Output width and height in pixels (default: {CANVAS_SIZE})",
    )
    args = parser.parse_args()
    if args.size <= 0:
        parser.error("--size must be greater than zero")
    return args


if __name__ == "__main__":
    arguments = parse_args()
    generate_favicon(arguments.output, arguments.size)
