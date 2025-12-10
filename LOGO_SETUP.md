# Logo and Favicon Setup Instructions

## Step 1: Add Your Logo Image

1. **Save your logo image** as `logo.png` or `logo.svg`
2. **Place it in**: `client/public/logo.png` (or `logo.svg`)

The logo should be:
- High resolution (at least 400x400px recommended)
- Transparent background (PNG with alpha channel)
- Format: PNG or SVG

## Step 2: Create Favicon Files

You need to create multiple favicon sizes from your logo:

### Required Sizes:
- `favicon-16x16.png` - 16x16 pixels
- `favicon-32x32.png` - 32x32 pixels  
- `apple-touch-icon.png` - 180x180 pixels (for iOS)
- `favicon.png` - 32x32 pixels (fallback)

### How to Create Favicons:

**Option 1: Online Tool (Easiest)**
1. Go to [favicon.io](https://favicon.io/favicon-converter/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload your logo image
3. Download the generated favicon files
4. Place them in `client/public/`

**Option 2: Manual (Using Image Editor)**
1. Open your logo in an image editor (Photoshop, GIMP, etc.)
2. Resize to each required size
3. Save as PNG files with the exact names listed above
4. Place in `client/public/`

**Option 3: Command Line (if you have ImageMagick)**
```bash
cd client/public
# Convert logo to different sizes
convert logo.png -resize 16x16 favicon-16x16.png
convert logo.png -resize 32x32 favicon-32x32.png
convert logo.png -resize 32x32 favicon.png
convert logo.png -resize 180x180 apple-touch-icon.png
```

## Step 3: File Structure

After setup, your `client/public/` folder should contain:

```
client/public/
  ├── logo.png (or logo.svg)          # Main logo image
  ├── favicon-16x16.png               # Small favicon
  ├── favicon-32x32.png               # Standard favicon
  ├── favicon.png                     # Fallback favicon
  ├── apple-touch-icon.png            # iOS home screen icon
  └── founder-jessica-lee-tingley.jpg # (existing)
```

## Step 4: Verify

1. **Logo appears on site**: Check navbar, footer, home page
2. **Favicon appears in browser tab**: Look at the browser tab icon
3. **Test on mobile**: Check iOS home screen icon

## Current Status

✅ Logo component updated to use image file  
✅ Favicon links updated in HTML  
⏳ **Waiting for logo image file** - Please add `logo.png` to `client/public/`  
⏳ **Waiting for favicon files** - Please add favicon files to `client/public/`

## Notes

- The logo component will automatically fall back to SVG if the image file is not found
- Favicon will use the fallback `favicon.png` if other sizes are missing
- For best results, use PNG format with transparent background
- Ensure logo is optimized for web (compressed but high quality)

