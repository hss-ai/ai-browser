// ─── SHORTCUTS SYSTEM ───
// Global keyboard shortcuts manager with conflict detection

const DEFAULT_SHORTCUTS = {
  'layout-2':     'Ctrl+2',
  'layout-3':     'Ctrl+3',
  'layout-4':     'Ctrl+4',
  'layout-5':     'Ctrl+5',
  'send':         'Ctrl+Enter',
  'clear-input':  'Ctrl+L',
  'cmd-palette':  'Ctrl+K',
  'settings':     'Ctrl+,',
  'search':       'Ctrl+Shift+F',
  'toggle-broadcast': 'Ctrl+B',
};

let shortcuts = {};

function loadShortcuts() {
  try {
    const saved = localStorage.getItem('ai-browser-shortcuts');
    shortcuts = saved ? JSON.parse(saved) : { ...DEFAULT_SHORTCUTS };
  } catch (e) {
    shortcuts = { ...DEFAULT_SHORTCUTS };
  }
}

function saveShortcuts() {
  try {
    localStorage.setItem('ai-browser-shortcuts', JSON.stringify(shortcuts));
  } catch (e) { /* ignore */ }
}

function resetShortcuts() {
  shortcuts = { ...DEFAULT_SHORTCUTS };
  saveShortcuts();
  showToast('快捷键已恢复默认');
}

function parseAccelerator(accel) {
  // Parse 'Ctrl+Shift+K' -> { ctrl: true, shift: true, key: 'k' }
  const parts = accel.toLowerCase().split('+');
  const result = { ctrl: false, alt: false, shift: false, meta: false, key: '' };
  parts.forEach(p => {
    if (p === 'ctrl' || p === 'cmd') result.ctrl = true;
    else if (p === 'alt') result.alt = true;
    else if (p === 'shift') result.shift = true;
    else if (p === 'meta') result.meta = true;
    else result.key = p;
  });
  return result;
}

function acceleratorMatch(parsed, e) {
  const modMatch =
    !!parsed.ctrl === (e.ctrlKey || e.metaKey) &&
    !!parsed.alt === e.altKey &&
    !!parsed.shift === e.shiftKey &&
    !!parsed.meta === e.metaKey;
  return modMatch && parsed.key === e.key.toLowerCase();
}

function findCommandByAccelerator(e) {
  for (const [cmdId, accel] of Object.entries(shortcuts)) {
    if (acceleratorMatch(parseAccelerator(accel), e)) {
      return cmdId;
    }
  }
  return null;
}

function executeCommand(cmdId) {
  switch (cmdId) {
    case 'layout-2': setLayout(2); break;
    case 'layout-3': setLayout(3); break;
    case 'layout-4': setLayout(4); break;
    case 'layout-5': setLayout(5); break;
    case 'send':
      if (document.getElementById('query-input').value.trim()) sendQuery();
      break;
    case 'clear-input':
      document.getElementById('query-input').value = '';
      document.getElementById('query-input').focus();
      break;
    case 'cmd-palette':
      toggleCommandPalette();
      break;
    case 'settings':
      toggleSettingsModal();
      break;
    case 'search':
      document.getElementById('query-input').focus();
      showToast('搜索功能将在 Phase 2 上线');
      break;
    case 'toggle-broadcast':
      toggleBroadcast();
      break;
    default:
      return false;
  }
  return true;
}

// Global shortcut handler — runs before individual handlers
document.addEventListener('keydown', function(e) {
  // Don't capture when typing in inputs (except for global shortcuts)
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    // Still allow Enter-based shortcuts in query input
    if (e.target.id !== 'query-input') return;
    // Handle Ctrl+Enter / plain Enter in query input
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendQuery();
      return;
    }
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      if (document.getElementById('query-input').value.trim()) {
        e.preventDefault();
        sendQuery();
      }
      return;
    }
    return;
  }

  // Don't capture when command palette is open
  if (document.getElementById('cmd-palette-overlay') &&
      document.getElementById('cmd-palette-overlay').style.display === 'flex') {
    return;
  }

  const cmdId = findCommandByAccelerator(e);
  if (cmdId) {
    e.preventDefault();
    executeCommand(cmdId);
  }
});

// Initialize
loadShortcuts();
