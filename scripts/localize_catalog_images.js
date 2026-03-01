const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '..', 'lib', 'catalog.ts');

function decodeFilenameFromUrl(url) {
  try {
    const last = url.split('/').pop() || '';
    return decodeURIComponent(last);
  } catch {
    const last = url.split('/').pop() || '';
    return last;
  }
}

function localizeCdnUrls(content) {
  const cdnRegex = /https?:\/\/cdn\.prod\.website-files\.com\/[^\s"']+\/([^\s"']+\.(?:png|jpg|jpeg|webp|gif|svg))/gi;
  return content.replace(cdnRegex, (match, _filename) => {
    const fname = decodeFilenameFromUrl(match);
    return `/images/catalog/${fname}`;
  });
}

function run() {
  if (!fs.existsSync(catalogPath)) {
    console.error('catalog.ts not found at', catalogPath);
    process.exit(1);
  }

  const before = fs.readFileSync(catalogPath, 'utf-8');
  const after = localizeCdnUrls(before);

  if (before === after) {
    console.log('No CDN image URLs found to localize.');
    process.exit(0);
  }

  fs.writeFileSync(catalogPath, after, 'utf-8');
  console.log('Localized CDN image URLs to /images/catalog in lib/catalog.ts');
}

run();

