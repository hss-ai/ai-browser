// ─── TEMPLATE LIBRARY (FR-C04) ───
// 15 built-in templates + custom CRUD

let templates = [];
let selectedTemplateId = null;

async function initTemplates() {
  templates = await listTemplates();
}

function toggleTemplatePanel() {
  templatePanelOpen = !templatePanelOpen;
  const panel = document.getElementById('template-panel');
  if (!panel) return;
  panel.style.display = templatePanelOpen ? 'flex' : 'none';
  if (templatePanelOpen) renderTemplateList();
}

function renderTemplateList() {
  const container = document.getElementById('template-list');
  if (!container) return;
  const categories = {};
  templates.forEach(t => {
    const cat = t.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  });

  let html = `<div class="template-search-wrap"><input type="text" id="template-search" placeholder="搜索模板…" oninput="filterTemplates(this.value)"></div>`;
  Object.entries(categories).forEach(([cat, items]) => {
    html += `<div class="template-category">${cat}</div>`;
    items.forEach(t => {
      html += `
        <div class="template-item" data-id="${t.id}" onclick="selectTemplate('${t.id}')">
          <div class="template-item-name">${escapeHtml(t.name)}</div>
          <div class="template-item-preview">${escapeHtml((t.body || '').slice(0, 60))}…</div>
        </div>`;
    });
  });
  html += `<div class="template-create-btn" onclick="createCustomTemplate()">+ ${i18n('templates.create')}</div>`;
  container.innerHTML = html;
}

function filterTemplates(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.template-item').forEach(el => {
    const name = (el.querySelector('.template-item-name')?.textContent || '').toLowerCase();
    el.style.display = name.includes(q) ? '' : 'none';
  });
}

function selectTemplate(id) {
  selectedTemplateId = id;
  const tpl = templates.find(t => t.id === id);
  if (!tpl) return;

  // If template has variables, show variable form
  if (tpl.variables && tpl.variables.length > 0) {
    showTemplateVarForm(tpl);
  } else {
    useTemplate(tpl, {});
  }
}

function showTemplateVarForm(tpl) {
  const container = document.getElementById('template-var-panel');
  if (!container) return;
  let formHTML = `<div class="template-var-header">${i18n('templates.variables')}</div>`;
  tpl.variables.forEach(v => {
    formHTML += `
      <div class="template-var-row">
        <label>${v.label || v.key}</label>
        <input type="text" id="tpl-var-${v.key}" value="${escapeHtml(v.default || '')}" placeholder="${v.label || v.key}">
      </div>`;
  });
  formHTML += `<button class="settings-btn" onclick="applyTemplateVars('${tpl.id}')">${i18n('templates.use')}</button>`;
  container.innerHTML = formHTML;
  container.style.display = 'block';
  templatePanelOpen = true;
  document.getElementById('template-panel').style.display = 'flex';
}

function applyTemplateVars(tplId) {
  const tpl = templates.find(t => t.id === tplId);
  if (!tpl) return;
  const vars = {};
  tpl.variables.forEach(v => {
    const input = document.getElementById(`tpl-var-${v.key}`);
    vars[v.key] = input ? input.value : (v.default || '');
  });
  useTemplate(tpl, vars);
  document.getElementById('template-var-panel').style.display = 'none';
}

function useTemplate(tpl, vars) {
  let body = tpl.body || '';
  Object.entries(vars).forEach(([key, value]) => {
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  // Put into query input
  const input = document.getElementById('query-input');
  if (input) {
    input.value = body;
    input.focus();
  }
  templatePanelOpen = false;
  document.getElementById('template-panel').style.display = 'none';
  showToast(i18n('toast.template.saved'));
}

async function createCustomTemplate() {
  const name = prompt('模板名称:');
  if (!name) return;
  const category = prompt('分类 (翻译/代码/写作/学习/产品):', '自定义');
  const body = prompt('模板内容 (使用 {{变量名}} 作为占位):');
  if (!body) return;

  const varMatches = body.match(/\{\{(\w+)\}\}/g) || [];
  const variables = [...new Set(varMatches.map(m => m.slice(2, -2)))].map(key => ({
    key, label: key, default: ''
  }));

  const tpl = {
    id: createTemplateId(),
    name,
    category: category || '自定义',
    body,
    variables,
    isBuiltin: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveTemplate(tpl);
  templates = await listTemplates();
  renderTemplateList();
  showToast(i18n('toast.template.saved'));
}

async function deleteCustomTemplate(id) {
  const tpl = templates.find(t => t.id === id);
  if (!tpl || tpl.isBuiltin) return;
  await deleteTemplate(id);
  templates = await listTemplates();
  renderTemplateList();
  showToast(i18n('toast.template.deleted'));
}
