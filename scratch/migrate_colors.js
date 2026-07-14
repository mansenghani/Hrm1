const fs = require('fs');
const path = require('path');

const frontendDir = path.resolve(__dirname, '../frontend');

// Helper to recursively walk files
function walk(dir, done) {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(frontendDir, (err, files) => {
  if (err) throw err;

  files.forEach(filePath => {
    const ext = path.extname(filePath);
    if (!['.jsx', '.js', '.css', '.html'].includes(ext)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Hex Color Replacements (case-insensitive)
    if (content.match(/#ff4f00/gi)) {
      content = content.replace(/#ff4f00/gi, '#00a76b');
      modified = true;
    }

    // 2. RGBA color replacements (case-insensitive)
    if (content.includes('rgba(255, 79, 0')) {
      content = content.replace(/rgba\(255,\s*79,\s*0/gi, 'rgba(0, 167, 107');
      modified = true;
    }

    // 3. Orange tailwind classes
    if (content.includes('orange-500')) {
      content = content.replace(/orange-500/g, 'emerald-500');
      modified = true;
    }
    if (content.includes('orange-200')) {
      content = content.replace(/orange-200/g, 'emerald-200');
      modified = true;
    }
    if (content.includes('orange-50')) {
      content = content.replace(/orange-50/g, 'emerald-50');
      modified = true;
    }
    if (content.includes('bg-orange-950')) {
      content = content.replace(/bg-orange-950/g, 'bg-emerald-950');
      modified = true;
    }

    // 4. Branding update in Layouts (FluidHR -> Verdant HR)
    if (filePath.endsWith('EmployeeLayout.jsx') && content.includes('FluidHR')) {
      content = content.replace(/FluidHR/g, 'Verdant HR');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${path.relative(frontendDir, filePath)}`);
    }
  });

  console.log('🎉 Color and branding migration completed.');
});
