import fs from 'fs';

// 1. Ensure firebase-applet-config.json exists
if (!fs.existsSync('./firebase-applet-config.json')) {
  fs.writeFileSync('./firebase-applet-config.json', '{}');
  console.log('Prebuild: Created fallback firebase-applet-config.json file.');
} else {
  console.log('Prebuild: firebase-applet-config.json exists.');
}

// 2. Ensure index.html exists in the same directory as package.json
if (!fs.existsSync('./index.html')) {
  const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exposys Data Labs</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  fs.writeFileSync('./index.html', indexHtmlContent);
  console.log('Prebuild: Restored missing index.html entry module successfully.');
} else {
  console.log('Prebuild: index.html exists.');
}
