# Felicitation Ceremony Banner Generator

A powerful and fully automated Node.js application that converts raw images into beautiful, high-resolution (4K) presentation banners for felicitation ceremonies or award events.

## Features

- **Automated Collage Generation**: Automatically reads all images from the `photos` folder and divides them into batches (3 photos per banner) to generate multiple banners simultaneously.
- **4K High Resolution**: Generates banners at an ultra-crisp `3840x2160` resolution, perfect for large-scale flex board printing.
- **Premium Design Aesthetics**:
  - Royal radial gradient background with subtle abstract golden waves.
  - Elegant deep blue and golden ribbon borders.
  - Golden 3D gradient text with rich drop shadows.
  - Cello-tape style photo pin effects for a realistic "scrapbook" layout.
- **Zero Cropping Engine**: Ensures that `100%` of every photo is visible. Dynamically resizes the polaroid frames to fit the image's original aspect ratio using a smart *contain* logic.
- **Auto Image Enhancement**: Features a built-in canvas filter (`brightness(1.6) contrast(1.15)`) that automatically brightens dark or low-quality photos (e.g., WhatsApp forwards) so faces are clearly visible.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- `canvas` library dependencies (If you are on Windows, pre-built binaries are usually downloaded automatically via npm)

## Installation

1. Clone or download this repository.
2. Open your terminal in the project directory.
3. Install the required Node.js packages:
   ```bash
   npm install canvas
   ```

## Usage

1. Create a folder named `photos` in the root directory (if it doesn't already exist).
2. Place all your student/achiever photos inside the `photos` directory. Supported formats: `.jpg`, `.jpeg`, `.png`.
3. Run the generator script:
   ```bash
   node working-generator.js
   ```
4. The script will automatically group the photos (3 per banner) and generate high-quality images like `banner_part_1.jpg`, `banner_part_2.jpg`, etc., in the main folder.

## Customization

You can easily customize the banner text and design by editing `working-generator.js`:

- **Change Text**: Search for `fillText` in the code to change the School Name, Ceremony Title, or Manager details.
- **Change Photos Per Banner**: Modify the `chunkSize` variable (currently set to `3`). *Note: You may need to adjust the `positions` array coordinates if you add more photos per page.*
- **Adjust Brightness**: Modify the line `ctx.filter = 'brightness(1.6) contrast(1.15)';` to fine-tune image brightness.

## License
MIT
