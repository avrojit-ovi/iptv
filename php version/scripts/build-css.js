const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let css = fs.readFileSync(path.join(root, 'app/src/index.css'), 'utf8');

css = css
  .replace(/@import[^;]+;/g, '')
  .replace(/@tailwind[^;]+;/g, '')
  .replace(/@layer (base|components) \{/g, '');

// Remove closing brace before Bootstrap comment (from @layer base)
css = css.replace(/\n\}\n\n\/\* ===== Bootstrap/, '\n/* ===== Bootstrap');

css = css.trim();
if (css.endsWith('}')) {
  css = css.slice(0, -1);
}

css += `

.tab-count {
  font-size: 0.625rem;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
}

.cat-chip.active .tab-count {
  background: rgba(0, 0, 0, 0.15);
}
`;

const outDir = path.join(root, 'assets/css');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'style.css'), css);
console.log('Created style.css', css.length, 'bytes');
