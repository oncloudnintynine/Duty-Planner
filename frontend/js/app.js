import { UI } from './store.js';
import { AppTemplate } from './components/shared.js';

// Resolve circular dependency by injecting render logic centrally
UI.render = function() {
    const activeEl = document.activeElement;
    const activeId = activeEl ? activeEl.id : null;
    let cursorStart = null;
    let cursorEnd = null;

    if (activeId && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        try {
            cursorStart = activeEl.selectionStart;
            cursorEnd = activeEl.selectionEnd;
        } catch (e) {} 
    }

    document.getElementById('app').innerHTML = AppTemplate(this.state);
    if (window.lucide) window.lucide.createIcons();

    if (this.state.activeTab === 'setup' && !this.state.editingRoleId) {
        if (typeof window.renderShiftInputs === 'function') {
            window.renderShiftInputs();
        }
    }

    if (activeId) {
        const restoredEl = document.getElementById(activeId);
        if (restoredEl) {
            restoredEl.focus();
            if (cursorStart !== null && cursorEnd !== null) {
                try { restoredEl.setSelectionRange(cursorStart, cursorEnd); } catch (e) {}
            }
        }
    }
};

// Bootstrap the application
window.onload = () => {
    UI.init();
};