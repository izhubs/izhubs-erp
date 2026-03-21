const fs = require('fs');
const https = require('https');
const path = require('path');

const steps = [
  { file: 'C:/Users/IsaacVu/.gemini/antigravity/brain/5620f6a8-023e-475c-9766-ccde7f2720c2/.system_generated/steps/179/output.txt', name: 'projects_list.png' },
  { file: 'C:/Users/IsaacVu/.gemini/antigravity/brain/5620f6a8-023e-475c-9766-ccde7f2720c2/.system_generated/steps/183/output.txt', name: 'ai_vibe_studio.png' },
  { file: 'C:/Users/IsaacVu/.gemini/antigravity/brain/5620f6a8-023e-475c-9766-ccde7f2720c2/.system_generated/steps/187/output.txt', name: 'project_settings.png' },
];

const outDir = 'd:/Project/izhubs-erp/modules/izlanding/mockups';
fs.mkdirSync(outDir, { recursive: true });

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  for (const s of steps) {
    const raw = fs.readFileSync(s.file, 'utf8');
    const json = JSON.parse(raw);
    const designComp = json.outputComponents.find(c => c.design);
    if (!designComp) { console.log('No design for', s.name); continue; }
    const url = designComp.design.screens[0].screenshot.downloadUrl;
    const dest = path.join(outDir, s.name);
    console.log(`Downloading ${s.name}...`);
    await download(url, dest);
    const stat = fs.statSync(dest);
    console.log(`  Saved: ${dest} (${stat.size} bytes)`);
  }
  console.log('Done!');
})();
