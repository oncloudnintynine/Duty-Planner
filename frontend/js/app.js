import { UI } from './store.js';

// Import View Modules
import { SetupDesktop, SetupMobile } from './views/setup.js';
import { ManageDesktop, ManageMobile } from './views/manage.js';
import { RosterDesktop, RosterMobile } from './views/roster.js';
import { CalcDesktop, CalcMobile } from './views/calculator.js';
import { SettingsDesktop, SettingsMobile } from './views/settings.js';

function DesktopLayout(state) {
    return `
    <div class="flex h-[100dvh] w-full bg-zinc-950 overflow-hidden">
        ${DesktopSidebar(state)}
        <main class="flex-1 overflow-y-auto relative h-full">
            <div class="p-8 w-full max-w-6xl mx-auto">
                ${state.activeTab === 'setup' ? SetupDesktop(state) : ''}
                ${state.activeTab === 'manage' ? ManageDesktop(state) : ''}
                ${state.activeTab === 'roster' ? RosterDesktop(state) : ''}
                ${state.activeTab === 'calc' ? CalcDesktop(state) : ''}
                ${state.activeTab === 'settings' ? SettingsDesktop(state) : ''}
            </div>
        </main>
    </div>
    ${state.loading ? Loader() : ''}
    ${InfoModal(state)}
    `;
}

function MobileLayout(state) {
    return `
    <div class="flex flex-col h-[100dvh] w-[100vw] bg-zinc-950 overflow-hidden pt-safe relative max-w-full">
        <main class="flex-1 overflow-y-auto overflow-x-hidden pb-[80px] w-full relative max-w-full">
            <div class="p-4 w-full">
                ${state.activeTab === 'setup' ? SetupMobile(state) : ''}
                ${state.activeTab === 'manage' ? ManageMobile(state) : ''}
                ${state.activeTab === 'roster' ? RosterMobile(state) : ''}
                ${state.activeTab === 'calc' ? CalcMobile(state) : ''}
                ${state.activeTab === 'settings' ? SettingsMobile(state) : ''}
            </div>
        </main>
        ${MobileNav(state)}
    </div>
    ${state.loading ? Loader() : ''}
    ${InfoModal(state)}
    `;
}

function DesktopSidebar(state) {
    const tabs = [
        { id: 'setup', name: 'Topology & Setup', icon: 'database' },
        { id: 'manage', name: 'Personnel & Assignments', icon: 'users' },
        { id: 'roster', name: 'Roster Engine', icon: 'calendar-days' },
        { id: 'calc', name: 'Manpower Calculator', icon: 'calculator' },
        { id: 'settings', name: 'Advanced Settings', icon: 'settings' }
    ];
    return `
    <aside class="w-72 bg-zinc-900 border-r border-zinc-800 flex-col z-10 shadow-2xl shrink-0 h-full">
        <div class="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 text-indigo-400 shrink-0">
                <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div><h1 class="text-lg font-black text-white leading-tight uppercase tracking-wider">DutyPlanner</h1></div>
        </div>
        <nav class="flex-1 p-4 space-y-2">
            ${tabs.map(t => `
                <button onclick="window.switchTab('${t.id}')" class="tab-btn w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${state.activeTab === t.id ? 'active' : 'text-zinc-400 hover:bg-zinc-800/50'} border-r-2 border-transparent outline-none">
                    <i data-lucide="${t.icon}" class="w-5 h-5"></i> ${t.name}
                </button>
            `).join('')}
        </nav>
    </aside>
    `;
}

function MobileNav(state) {
    const tabs = [
        { id: 'setup', name: 'Setup', icon: 'database' },
        { id: 'manage', name: 'Personnel', icon: 'users' },
        { id: 'roster', name: 'Roster', icon: 'calendar-days' },
        { id: 'calc', name: 'Calculator', icon: 'calculator' },
        { id: 'settings', name: 'Settings', icon: 'settings' }
    ];
    return `
    <div class="fixed bottom-0 left-0 right-0 w-[100vw] max-w-[100vw] bg-zinc-900 border-t border-zinc-800 z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div class="flex justify-around items-center h-[72px] px-1">
            ${tabs.map(t => `
                <button onclick="window.switchTab('${t.id}')" class="mobile-tab-btn flex-1 flex flex-col items-center justify-center gap-1.5 transition-colors ${state.activeTab === t.id ? 'active text-indigo-400' : 'text-zinc-500'} outline-none">
                    <i data-lucide="${t.icon}" class="w-[22px] h-[22px] ${state.activeTab === t.id ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}"></i>
                    <span class="text-[10px] font-black tracking-widest uppercase">${t.name}</span>
                </button>
            `).join('')}
        </div>
    </div>
    `;
}

function Loader() {
    return `
    <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[300] flex flex-col items-center justify-center animate-in fade-in duration-200 w-full h-full">
        <div class="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
        <p class="text-indigo-300 font-black tracking-widest text-sm uppercase animate-pulse">Syncing Database...</p>
    </div>
    `;
}

function InfoModal(state) {
    if (!state.activeModal) return '';
    const m = {
        'onSite': { title: 'On-Site Demand', htmlContent: `<p class="text-zinc-300">Total weekly hours required to man all active shifts. E.g., 12-hr shift × 7 days × 2 pax = 168 hrs/wk.</p>` },
        'standby': { title: 'Standby Buffers', htmlContent: `<p class="text-zinc-300">Statistical buffer: 2 activations/month × 24 hrs = 48 hrs/month = ~12 hrs/week per assigned headcount.</p>` },
        'baseReq': { title: 'Base Req. Headcount', htmlContent: `<p class="text-zinc-300">Total operational hours divided by 15 hrs/person capacity.</p>` },
        'reserve': { title: 'Dedicated Reserves', htmlContent: `<p class="text-zinc-300">1 Reserve/shift × 7 days = 7 shifts/week. Divided by 3.682 effective shifts/person = ~1.9 (Rounded to 2).</p>` },
        'totalReq': { title: 'Total Headcount Needed', htmlContent: `<p class="text-zinc-300">Base operations + Dedicated reserve pool.</p>` }
    };
    
    const data = m[state.activeModal] || m['onSite'];
    
    return `
    <div class="fixed inset-0 z-[250] flex items-center justify-center p-4 lg:p-6 pb-24 lg:pb-6">
        <div class="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm transition-opacity" onclick="window.closeModal()"></div>
        <div class="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full max-w-md animate-in zoom-in-95 fade-in flex flex-col">
            <div class="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/80">
                <h3 class="text-lg font-black text-white flex items-center gap-2 uppercase"><i data-lucide="info" class="w-6 h-6 text-indigo-400"></i> ${data.title}</h3>
            </div>
            <div class="p-6 overflow-y-auto text-base text-zinc-300 leading-relaxed bg-zinc-900">
                ${data.htmlContent}
            </div>
            <div class="p-5 border-t border-zinc-800 bg-zinc-950/90 flex justify-end">
                <button onclick="window.closeModal()" class="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 lg:py-3 rounded-xl font-black uppercase tracking-widest border border-indigo-500/50">Acknowledge</button>
            </div>
        </div>
    </div>
    `;
}

UI.render = function() {
    const activeEl = document.activeElement;
    const activeId = activeEl ? activeEl.id : null;
    let cursorStart = null, cursorEnd = null;
    if (activeId && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        try { cursorStart = activeEl.selectionStart; cursorEnd = activeEl.selectionEnd; } catch (e) {} 
    }

    // Dynamic View Router
    const template = this.state.isMobile ? MobileLayout(this.state) : DesktopLayout(this.state);
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