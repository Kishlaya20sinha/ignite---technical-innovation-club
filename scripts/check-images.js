import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read data.ts manually (simple regex parsing)
const dataPath = path.join(__dirname, '../data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

// Extract all image paths pointing to 'public' (starting with /)
// Regex to capture "image: '/foo/bar.jpg'" or similar
const imageRegex = /image:\s*["']([^"']+)["']/g;
const srcRegex = /src:\s*["']([^"']+)["']/g;

let matches;
const foundPaths = [];

while ((matches = imageRegex.exec(dataContent)) !== null) {
    foundPaths.push(matches[1]);
}
while ((matches = srcRegex.exec(dataContent)) !== null) {
    foundPaths.push(matches[1]);
}

const publicDir = path.join(__dirname, '../public');
console.log(`Public dir: ${publicDir}`);

console.log(`Checking ${foundPaths.length} image paths...`);

let errorCount = 0;

foundPaths.forEach(imgRelPath => {
    // Skip external links or placeholders that might not exist or are special cases
    if (imgRelPath.startsWith('http')) return;
    if (imgRelPath === '/placeholder.svg') return; // Assume this exists or is handled

    // Remove leading slash for join
    const cleanRelPath = imgRelPath.startsWith('/') ? imgRelPath.slice(1) : imgRelPath;
    const fullPath = path.join(publicDir, cleanRelPath);
    const dir = path.dirname(fullPath);
    const filename = path.basename(fullPath);

    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir} for image ${imgRelPath}`);
        errorCount++;
        return;
    }

    // Check if directory exists with correct casing
    const parentDir = path.dirname(dir);
    const dirName = path.basename(dir);
    try {
        const parentFiles = fs.readdirSync(parentDir);
        if (!parentFiles.includes(dirName)) {
             const actualDir = parentFiles.find(f => f.toLowerCase() === dirName.toLowerCase());
             console.error(`Directory Case Mismatch for ${imgRelPath}: Code uses '${dirName}' but filesystem has '${actualDir}'`);
             errorCount++;
        }
    } catch (e) {
        console.error(`Error reading parent dir ${parentDir}: ${e.message}`);
    }


    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${imgRelPath}`);
        errorCount++;
        
        // Check if it exists with different casing
        try {
            const actualFiles = fs.readdirSync(dir);
            const lowerFilename = filename.toLowerCase();
            const found = actualFiles.find(f => f.toLowerCase() === lowerFilename);
            if (found) {
                console.error(`  -> But found similar file: ${found} (Case mismatch!)`);
            }
        } catch (e) {}
    } else {
        // Strict case check
        try {
            const actualFiles = fs.readdirSync(dir);
            if (!actualFiles.includes(filename)) {
                 const actual = actualFiles.find(f => f.toLowerCase() === filename.toLowerCase());
                 console.error(`Case mismatch for ${imgRelPath}: Code uses '${filename}' but filesystem has '${actual}'`);
                 errorCount++;
            }
        } catch (e) {
            console.error(`Error reading dir ${dir}: ${e.message}`);
        }
    }
});

if (errorCount > 0) {
    console.error(`Found ${errorCount} errors.`);
    process.exit(1);
} else {
    console.log("All image paths are valid and match filesystem casing!");
}
