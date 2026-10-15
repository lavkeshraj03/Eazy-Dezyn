#!/usr/bin/env node
/*
 * build.js - turns templates + page data into the finished static pages.
 *
 *   node build.js            build every page in data/pages/
 *   node build.js estimate   build one page (the file name without .json)
 *   node build.js --check    build everything in memory and only report problems (writes nothing)
 *   node build.js --new my-page [--from estimate]
 *                            start a new page: copies the data of an existing page to data/pages/my-page.json
 *
 * Inputs
 *   templates/page.html          the page skeleton
 *   templates/partials/*.html    one file per section, pulled in with {{> name}}
 *   data/site.json               defaults shared by every page (footer, logo, ...)
 *   data/pages/<name>.json       the words, prices, images and links of one page
 *
 * A page's data is merged on top of data/site.json (objects merge, lists are replaced).
 * Output goes to the "output" path inside the page data (default: <page name>.html in the project root).
 * The build never overwrites index.html: that file is the original hand-made page.
 * Image / link paths in the data are written from the site root ("assets/..."); the build puts
 * the right number of "../" in front for pages that live in a sub-folder ({{root}}).
 *
 * Template language (kept deliberately small)
 *   {{path.to.value}}              insert a value (HTML is NOT escaped - write &amp; yourself)
 *   {{#each list}} ... {{/each}}   repeat for every item of a list; inside: {{field}}, {{.}} (the item),
 *                                  {{@index}} (0,1,2..), {{@index1}} (1,2,3..), {{@num2}} (01,02,03..),
 *                                  {{@first}}, {{@last}}
 *   {{#if path}} ... {{else}} ... {{/if}}   show a block only when the value is set / non-empty
 *   {{> partial-name}}             include templates/partials/partial-name.html
 *   {{! comment }}                 removed from the output
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATE_DIR = path.join(ROOT, 'templates');
const PARTIAL_DIR = path.join(TEMPLATE_DIR, 'partials');
const DATA_DIR = path.join(ROOT, 'data');
const PAGES_DIR = path.join(DATA_DIR, 'pages');

/* ---------------------------------------------------------------- data helpers */

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`Could not read ${path.relative(ROOT, file)}: ${e.message}`);
  }
}

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function merge(base, over) {
  if (!isObject(base) || !isObject(over)) return over === undefined ? base : over;
  const out = Object.assign({}, base);
  Object.keys(over).forEach((k) => {
    out[k] = isObject(base[k]) && isObject(over[k]) ? merge(base[k], over[k]) : over[k];
  });
  return out;
}

/* ---------------------------------------------------------------- template parser */

const TAG = /\{\{\s*([#\/>!]?)\s*([^}]*?)\s*\}\}/g;

/* A tag that sits alone on its line takes the whole line with it, so block tags leave no blank lines. */
function stripStandaloneTags(src) {
  return src.replace(/^[ \t]*(\{\{\s*(?:[#\/>!][^}]*|else)\s*\}\})[ \t]*\r?\n/gm, '$1');
}

function parse(src, label) {
  src = stripStandaloneTags(src);
  const root = { type: 'root', children: [] };
  const stack = [root];
  // nodes are added to the branch that is currently open ({{else}} switches an {{#if}} to its else branch)
  const add = (node) => {
    const top = stack[stack.length - 1];
    (top.inElse ? top.elseChildren : top.children).push(node);
  };
  let last = 0;
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(src))) {
    if (m.index > last) add({ type: 'text', value: src.slice(last, m.index) });
    last = m.index + m[0].length;
    const sigil = m[1];
    const body = m[2];
    if (sigil === '!') continue;
    if (sigil === '>') {
      add({ type: 'partial', name: body });
    } else if (sigil === '#') {
      const parts = body.split(/\s+/);
      const kind = parts[0];
      if (kind !== 'each' && kind !== 'if') throw new Error(`${label}: unknown block "{{#${body}}}"`);
      const node = { type: kind, path: parts.slice(1).join(' '), children: [], elseChildren: [], inElse: false, label };
      add(node);
      stack.push(node);
    } else if (sigil === '/') {
      const open = stack.pop();
      if (!open || open === root || open.type !== body) throw new Error(`${label}: "{{/${body}}}" does not match an opening tag`);
    } else if (body === 'else') {
      const open = stack[stack.length - 1];
      if (open.type !== 'if') throw new Error(`${label}: "{{else}}" only works inside {{#if}}`);
      open.inElse = true;
    } else {
      add({ type: 'var', path: body, label });
    }
  }
  if (last < src.length) add({ type: 'text', value: src.slice(last) });
  if (stack.length !== 1) throw new Error(`${label}: "{{#${stack[stack.length - 1].type}}}" is never closed`);
  return root;
}

/* ---------------------------------------------------------------- renderer */

function lookup(pathStr, scopes) {
  if (pathStr === '.') return { found: true, value: scopes[0].item };
  const parts = pathStr.split('.');
  for (const scope of scopes) {
    if (scope.helpers && pathStr in scope.helpers) return { found: true, value: scope.helpers[pathStr] };
    let cur = scope.item;
    let ok = true;
    for (const p of parts) {
      if (cur !== null && cur !== undefined && typeof cur === 'object' && p in cur) cur = cur[p];
      else { ok = false; break; }
    }
    if (ok) return { found: true, value: cur };
  }
  return { found: false };
}

function truthy(v) {
  if (Array.isArray(v)) return v.length > 0;
  return !!v && v !== 'false';
}

function makeRenderer(partials, problems) {
  function renderNodes(nodes, scopes, out, depth) {
    for (const n of nodes) {
      if (n.type === 'text') {
        out.push(n.value);
      } else if (n.type === 'var') {
        const r = lookup(n.path, scopes);
        if (!r.found || r.value === undefined || r.value === null) {
          problems.add(`missing value "${n.path}" (used in ${n.label})`);
        } else if (typeof r.value === 'object') {
          problems.add(`"${n.path}" is a list/group, not text (used in ${n.label})`);
        } else {
          out.push(String(r.value));
        }
      } else if (n.type === 'partial') {
        if (depth > 20) throw new Error(`partials nest too deeply at "${n.name}"`);
        const p = partials[n.name];
        if (!p) { problems.add(`unknown partial "${n.name}"`); continue; }
        renderNodes(p.children, scopes, out, depth + 1);
      } else if (n.type === 'if') {
        const r = lookup(n.path, scopes);
        const on = r.found && truthy(r.value);
        renderNodes(on ? n.children : n.elseChildren, scopes, out, depth);
      } else if (n.type === 'each') {
        const r = lookup(n.path, scopes);
        if (!r.found || !Array.isArray(r.value)) {
          problems.add(`"${n.path}" must be a list (used in ${n.label})`);
          continue;
        }
        r.value.forEach((item, i) => {
          const helpers = {
            '@index': i,
            '@index1': i + 1,
            '@num2': String(i + 1).padStart(2, '0'),
            '@first': i === 0,
            '@last': i === r.value.length - 1
          };
          renderNodes(n.children, [{ item, helpers }].concat(scopes), out, depth);
        });
      }
    }
  }
  return (tree, data) => {
    const out = [];
    renderNodes(tree.children, [{ item: data }], out, 0);
    return out.join('');
  };
}

/* ---------------------------------------------------------------- build */

function loadPartials() {
  const partials = {};
  if (!fs.existsSync(PARTIAL_DIR)) return partials;
  fs.readdirSync(PARTIAL_DIR).filter((f) => f.endsWith('.html')).forEach((f) => {
    const name = f.replace(/\.html$/, '');
    partials[name] = parse(fs.readFileSync(path.join(PARTIAL_DIR, f), 'utf8'), `partial "${name}"`);
  });
  return partials;
}

function buildPage(name, partials, template, site, writeFiles) {
  const file = path.join(PAGES_DIR, `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`No page data found at data/pages/${name}.json`);
  const page = merge(site, readJson(file));
  const output = page.output || `${name}.html`;
  if (path.normalize(output) === 'index.html' && !process.argv.includes('--allow-index')) {
    throw new Error(`Page "${name}" would overwrite index.html (the original hand-made page). Give it another "output" name, e.g. "${name}.html".`);
  }
  const depth = output.split('/').length - 1;
  page.root = depth > 0 ? '../'.repeat(depth) : '';
  page.pageName = name;

  const problems = new Set();
  const html = makeRenderer(partials, problems)(template, page);
  if (problems.size) {
    const list = Array.from(problems).map((p) => `  - ${p}`).join('\n');
    throw new Error(`Page "${name}" has problems:\n${list}`);
  }
  if (writeFiles) {
    const dest = path.join(ROOT, output);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, html);
  }
  return { output, bytes: Buffer.byteLength(html) };
}

function newPage(args) {
  const name = args[args.indexOf('--new') + 1];
  if (!name || name.startsWith('--') || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error('Give the new page a name made of lowercase letters, numbers and dashes, e.g. node build.js --new master-rate-sheet');
  }
  const fromIdx = args.indexOf('--from');
  const from = fromIdx >= 0 ? args[fromIdx + 1] : 'estimate';
  const src = path.join(PAGES_DIR, `${from}.json`);
  const dest = path.join(PAGES_DIR, `${name}.json`);
  if (!fs.existsSync(src)) throw new Error(`No page data to copy at data/pages/${from}.json`);
  if (fs.existsSync(dest)) throw new Error(`data/pages/${name}.json already exists`);
  const data = readJson(src);
  data.output = `${name}.html`;
  fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n');
  console.log(`created data/pages/${name}.json (a copy of "${from}")`);
  console.log(`next: edit the words, prices, images and links in that file, then run: node build.js ${name}`);
  console.log(`the page will be built as ${name}.html`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--new')) {
    try { newPage(args); } catch (e) { console.error(e.message); process.exit(1); }
    return;
  }
  const check = args.includes('--check');
  const wanted = args.filter((a) => !a.startsWith('--'));
  const site = fs.existsSync(path.join(DATA_DIR, 'site.json')) ? readJson(path.join(DATA_DIR, 'site.json')) : {};
  const partials = loadPartials();
  const template = parse(fs.readFileSync(path.join(TEMPLATE_DIR, 'page.html'), 'utf8'), 'templates/page.html');
  const names = wanted.length
    ? wanted
    : fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

  let failed = false;
  names.forEach((name) => {
    try {
      const r = buildPage(name, partials, template, site, !check);
      console.log(`${check ? 'ok   ' : 'built'}  ${name}  ->  ${r.output}  (${(r.bytes / 1024).toFixed(1)} KB)`);
    } catch (e) {
      failed = true;
      console.error(`FAILED ${name}\n${e.message}`);
    }
  });
  if (failed) process.exit(1);
}

main();
