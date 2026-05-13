// ─── WORKFLOW ENGINE (FR-C05) ───
// DAG-based multi-step AI pipeline

let workflowNodes = [];
let workflowEdges = [];
let workflowRunning = false;
let workflowPaused = false;

// Default preset: "GPT outlines → Claude expands"
const DEFAULT_WORKFLOW = [
  { id: 'node-1', ai: 'chatgpt', template: '请为「{{topic}}」生成一个详细的大纲，包含主要章节和要点。', label: 'GPT 生成大纲' },
  { id: 'node-2', ai: 'claude', template: '请根据以下大纲，撰写一篇完整的文章：\n\n{{input}}', label: 'Claude 撰写文章', deps: ['node-1'] },
];

function initWorkflow() {
  workflowNodes = [...DEFAULT_WORKFLOW];
  workflowEdges = [{ from: 'node-1', to: 'node-2' }];
}

function toggleWorkflowPanel() {
  workflowPanelOpen = !workflowPanelOpen;
  const panel = document.getElementById('workflow-panel');
  if (!panel) return;
  panel.style.display = workflowPanelOpen ? 'flex' : 'none';
  if (workflowPanelOpen) renderWorkflow();
}

function renderWorkflow() {
  const container = document.getElementById('workflow-content');
  if (!container) return;

  const nodesHTML = workflowNodes.map(n => `
    <div class="workflow-node" id="wf-node-${n.id}">
      <div class="workflow-node-header">
        <span class="workflow-node-label">${n.label || n.id}</span>
        <span class="workflow-node-ai">${(getModelConfig(n.ai) || {}).name || n.ai}</span>
        ${n.deps && n.deps.length > 0 ? `<span class="workflow-node-deps">← 依赖: ${n.deps.join(', ')}</span>` : ''}
      </div>
      <div class="workflow-node-body">
        <textarea class="workflow-template-input" data-node="${n.id}" rows="3">${escapeHtml(n.template || '')}</textarea>
      </div>
      <div class="workflow-node-status" id="wf-status-${n.id}"></div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="workflow-header">
      <h3>${i18n('workflow.title')}</h3>
      <div class="workflow-actions">
        <button class="settings-btn" onclick="runWorkflow()" ${workflowRunning ? 'disabled' : ''}>${i18n('workflow.run')}</button>
        <button class="settings-btn" onclick="stopWorkflow()">${i18n('workflow.stop')}</button>
        <button class="settings-btn" onclick="addWorkflowNode()">${i18n('workflow.addNode')}</button>
      </div>
    </div>
    <div class="workflow-topics">
      <input type="text" id="workflow-topic" placeholder="工作流主题…" value="">
    </div>
    <div class="workflow-nodes">${nodesHTML}</div>
  `;
}

function addWorkflowNode() {
  const id = 'node-' + (workflowNodes.length + 1);
  workflowNodes.push({
    id,
    ai: 'chatgpt',
    template: '',
    label: '新节点',
    deps: [],
  });
  renderWorkflow();
}

// Simple topological sort for DAG execution
function topologicalSort(nodes, edges) {
  const inDegree = {};
  const adj = {};
  nodes.forEach(n => { inDegree[n.id] = 0; adj[n.id] = []; });
  edges.forEach(e => {
    adj[e.from] = adj[e.from] || [];
    adj[e.from].push(e.to);
    inDegree[e.to] = (inDegree[e.to] || 0) + 1;
  });

  const queue = [];
  Object.entries(inDegree).forEach(([id, deg]) => {
    if (deg === 0) queue.push(id);
  });

  const result = [];
  while (queue.length > 0) {
    // Execute nodes at the same level in parallel
    const level = [...queue];
    queue.length = 0;
    result.push(level);
    level.forEach(nodeId => {
      (adj[nodeId] || []).forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      });
    });
  }
  return result;
}

async function runWorkflow() {
  if (workflowRunning) return;
  workflowRunning = true;
  const topic = document.getElementById('workflow-topic')?.value || '';

  // Collect current template values from UI
  workflowNodes.forEach(n => {
    const textarea = document.querySelector(`.workflow-template-input[data-node="${n.id}"]`);
    if (textarea) n.template = textarea.value;
  });

  const levels = topologicalSort(workflowNodes, workflowEdges);
  const outputs = {}; // nodeId -> extracted text

  showToast(i18n('toast.workflow.running'));

  for (const level of levels) {
    if (!workflowRunning) break;

    const promises = level.map(async (nodeId) => {
      const node = workflowNodes.find(n => n.id === nodeId);
      if (!node) return;

      // Build input from dependencies
      let input = topic;
      if (node.deps && node.deps.length > 0) {
        input = node.deps.map(depId => outputs[depId] || '').join('\n\n');
      }

      // Replace {{input}} in template
      let prompt = (node.template || '').replace(/\{\{input\}\}/g, input);
      prompt = prompt.replace(/\{\{topic\}\}/g, topic);

      // Send to AI panel
      const wv = document.getElementById(`wv-${node.ai}`);
      if (!wv || !AI_TYPES[node.ai]) {
        updateNodeStatus(nodeId, 'failed', 'Panel not found');
        return;
      }

      updateNodeStatus(nodeId, 'running', 'Sending…');
      try {
        await wv.executeJavaScript(AI_TYPES[node.ai].inject(prompt));
        updateNodeStatus(nodeId, 'sent', 'Waiting for response…');
        // Extract result after waiting
        await new Promise(r => setTimeout(r, 3000));
        const extractFn = AI_TYPES[node.ai].extract ? AI_TYPES[node.ai].extract() : null;
        if (extractFn) {
          const result = await wv.executeJavaScript(extractFn);
          outputs[nodeId] = result || '';
          updateNodeStatus(nodeId, 'done', '✓ Complete');
        } else {
          outputs[nodeId] = '';
          updateNodeStatus(nodeId, 'done', '✓ Sent (no extractor)');
        }
      } catch (e) {
        updateNodeStatus(nodeId, 'failed', 'Error: ' + e.message);
        showToast(i18n('toast.workflow.failed', { error: e.message }));
      }
    });

    await Promise.all(promises);
  }

  workflowRunning = false;
  showToast(i18n('toast.workflow.done'));
}

function stopWorkflow() {
  workflowRunning = false;
}

function updateNodeStatus(nodeId, status, message) {
  const el = document.getElementById(`wf-status-${nodeId}`);
  if (!el) return;
  el.className = 'workflow-node-status ' + status;
  el.textContent = message;
}
