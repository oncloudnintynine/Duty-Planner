import { UI } from './store.js';
import { AppTemplate } from './components/shared.js';

UI.render = function() {
   const activeEl = document.activeElement;
   const activeId = activeEl ? activeEl.id : null;
   let cursorStart = null, cursorEnd = null;
   if (activeId && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
       try { cursorStart = activeEl.selectionStart; cursorEnd = activeEl.selectionEnd; } catch (e) {} 
   }

   // Dynamic View Router using the unified AppTemplate
   const template = AppTemplate(this.state);
   document.getElementById('app').innerHTML = template;
   if (window.lucide) window.lucide.createIcons();

   if (this.state.activeTab === 'setup' && !this.state.editingRoleId && typeof window.renderShiftInputs === 'function') {
       window.renderShiftInputs();
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

window.onload = () => { UI.init(); };