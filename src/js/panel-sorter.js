// ─── PANEL SORTER ───
// Drag-and-drop panel reordering via HTML5 Drag and Drop API

let draggedPanel = null;
let panelOrder = [];

function loadPanelOrder() {
  try {
    const saved = localStorage.getItem('ai-browser-panel-order');
    if (saved) {
      panelOrder = JSON.parse(saved);
      // Ensure all primary panels are present
      PRIMARY_ORDER.forEach(type => {
        if (!panelOrder.includes(type)) panelOrder.push(type);
      });
    } else {
      panelOrder = [...PRIMARY_ORDER];
    }
  } catch (e) {
    panelOrder = [...PRIMARY_ORDER];
  }
}

function savePanelOrder() {
  try {
    localStorage.setItem('ai-browser-panel-order', JSON.stringify(panelOrder));
  } catch (e) { /* ignore */ }
}

function getPanelOrder() {
  return panelOrder;
}

function initPanelSorter() {
  loadPanelOrder();
  applyPanelOrder();

  const container = document.getElementById('panels-container');
  if (!container) return;

  // Watch for new panels (clones) being added
  const observer = new MutationObserver(() => {
    bindDragEvents();
  });
  observer.observe(container, { childList: true });

  bindDragEvents();
}

function bindDragEvents() {
  document.querySelectorAll('#panels-container .panel .panel-header').forEach(header => {
    // Only bind once
    if (header.dataset.dragBound === '1') return;
    header.dataset.dragBound = '1';

    header.setAttribute('draggable', 'true');

    header.addEventListener('dragstart', (e) => {
      const panel = header.closest('.panel');
      if (!panel) return;
      draggedPanel = panel;
      panel.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', panel.id);
    });

    header.addEventListener('dragend', (e) => {
      const panel = header.closest('.panel');
      if (panel) panel.classList.remove('dragging');
      draggedPanel = null;
      // Save new order after drag
      updatePanelOrder();
    });
  });

  document.querySelectorAll('#panels-container .panel').forEach(panel => {
    if (panel.dataset.dropBound === '1') return;
    panel.dataset.dropBound = '1';

    panel.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!draggedPanel || draggedPanel === panel) return;

      const container = document.getElementById('panels-container');
      const panels = [...container.querySelectorAll('.panel')];
      const draggedIdx = panels.indexOf(draggedPanel);
      const targetIdx = panels.indexOf(panel);

      if (draggedIdx < targetIdx) {
        container.insertBefore(draggedPanel, panel.nextSibling);
      } else {
        container.insertBefore(draggedPanel, panel);
      }
    });

    panel.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  });
}

function applyPanelOrder() {
  const container = document.getElementById('panels-container');
  if (!container) return;

  const panels = container.querySelectorAll('.panel');
  const panelMap = {};
  panels.forEach(p => {
    const type = p.dataset.type || p.dataset.ai;
    panelMap[type] = p;
  });

  // Reorder based on saved order
  panelOrder.forEach(type => {
    const panel = panelMap[type];
    if (panel && panel.parentNode === container) {
      container.appendChild(panel);
    }
  });

  // Append any panels not in the order list at the end
  panels.forEach(p => {
    const type = p.dataset.type || p.dataset.ai;
    if (!panelOrder.includes(type) && p.parentNode === container) {
      container.appendChild(p);
    }
  });
}

function updatePanelOrder() {
  const container = document.getElementById('panels-container');
  if (!container) return;

  const panels = container.querySelectorAll('.panel');
  const order = [];
  panels.forEach(p => {
    const type = p.dataset.type || p.dataset.ai;
    if (type) order.push(type);
  });
  panelOrder = order;
  savePanelOrder();
}

// Public API: reorder a specific panel to a position
function movePanelToPosition(panelType, index) {
  const idx = panelOrder.indexOf(panelType);
  if (idx >= 0) {
    panelOrder.splice(idx, 1);
  }
  panelOrder.splice(index, 0, panelType);
  savePanelOrder();
  applyPanelOrder();
}
