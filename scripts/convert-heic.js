const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'Public');
const outDir = path.join(__dirname, '..', 'public', 'team');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => /\.heic$/i.test(f));

if (files.length === 0) {
  console.log('No HEIC files found in Public/ to convert.');
  process.exit(0);
}

(async () => {
  for (const file of files) {
    const src = path.join(srcDir, file);
    const base = path.parse(file).name;
    const out = path.join(outDir, base + '.jpg');
    try {
      await sharp(src)
        .jpeg({ quality: 90 })
        .toFile(out);
      console.log(`Converted ${file} -> ${path.relative(process.cwd(), out)}`);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
    }
  }
})();