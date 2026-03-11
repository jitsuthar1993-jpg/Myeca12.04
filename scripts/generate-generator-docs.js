const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function template(tpl, data) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ''));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const root = process.cwd();
  const registryPath = path.join(root, 'client', 'src', 'data', 'generator-registry.json');
  const comingTplPath = path.join(root, 'docs', 'generators', 'templates', 'coming-soon.md');
  const specTplPath = path.join(root, 'docs', 'generators', 'templates', 'generator-spec.md');
  const outDir = path.join(root, 'docs', 'generators');

  const registry = readJSON(registryPath);
  const comingTpl = fs.readFileSync(comingTplPath, 'utf-8');
  const specTpl = fs.readFileSync(specTplPath, 'utf-8');

  ensureDir(outDir);

  registry.generators.forEach(gen => {
    const baseData = {
      title: gen.name,
      id: gen.id,
      category: gen.category,
      type: gen.type,
      version: gen.version,
      owner: gen.owner,
      priority: gen.priority,
      dependencies: (gen.dependencies || []).join(', ') || 'None',
      purpose: gen.description,
      inputs: '',
      outputs: '',
      constraints: '',
      libraries: '',
      release_date: '',
      date: '',
      change: '',
      author: '',
      reviewer: '',
      approved: ''
    };
    const outFile = path.join(outDir, `${gen.id}.md`);
    const content = gen.status === 'coming_soon'
      ? template(comingTpl, baseData)
      : template(specTpl, { ...baseData, overview: gen.description });
    fs.writeFileSync(outFile, content, 'utf-8');
  });

  console.log(`Generated docs for ${registry.generators.length} generators in ${outDir}`);
}

if (require.main === module) {
  main();
}
