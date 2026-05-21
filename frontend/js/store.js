import { API } from './api.js';

export const UI = {
    state: {
        isMobile: window.innerWidth < 1024,
        activeTab: 'setup',
        loading: false,
        lastMonth: '',
        searchQuery: '',
        selectedPersonId: null,
        editingRoleId: null,
        viewMode: 'both',
        activeModal: null,
        data: { seniorities: [], personnel: [], roles: [], shifts: [], tags: [], schedule: [] }
    },
    
    init() {
        this.dispatch('sync');
        window.addEventListener('resize', () => {
            const currentIsMobile = window.innerWidth < 1024;
            if (currentIsMobile !== this.state.isMobile) {
                this.state.isMobile = currentIsMobile;
                this.render();
                if(this.state.activeTab === 'setup' && typeof window.renderShiftInputs === 'function') {
                    setTimeout(window.renderShiftInputs, 50);
                }
            }
        });
    },

    async dispatch(action, payload = {}) {
        this.state.loading = true;
        this.render(); 
        
        try {
            const json = await API.post(action, payload);
            if (json.status === 'success') {
                this.state.data = json.data;
                if (json.message) this.showToast(json.message, 'success');
                if (action === 'deletePerson' && payload.id === this.state.selectedPersonId) this.state.selectedPersonId = null;
                if (action === 'updateRole' || action === 'addRole') this.state.editingRoleId = null;
                if (action === 'deleteRole' && payload.id === this.state.editingRoleId) this.state.editingRoleId = null;
            } else {
                this.showToast(json.message || "An error occurred", 'error');
            }
        } catch (e) {
            this.showToast(e.message, 'error');
        }
        
        this.state.loading = false;
        this.render();
    },

    showToast(msg, type) {
        const existing = document.getElementById('toast-container');
        if (existing) existing.remove();
        
        const isErr = type === 'error';
        const toastHtml = `
        <div id="toast-container" class="fixed top-safe pt-2 left-1/2 -translate-x-1/2 lg:top-auto lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0 z-[200] animate-in slide-in-from-top-4 lg:slide-in-from-bottom-4 fade-in duration-200 w-[92%] lg:w-auto max-w-sm">
            <div class="${isErr ? 'bg-red-600 dark:bg-red-500 text-white' : 'bg-zinc-900 dark:bg-zinc-800 text-white'} px-4 py-3 rounded-lg shadow-xl font-medium text-sm flex items-center gap-3 border ${isErr ? 'border-red-400' : 'border-zinc-700'}">
                <i data-lucide="${isErr ? 'alert-octagon' : 'check-circle'}" class="w-5 h-5 shrink-0 ${isErr ? 'text-white' : 'text-emerald-400'}"></i>
                <span class="flex-1 leading-snug">${msg}</span>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => { const t = document.getElementById('toast-container'); if (t) { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s ease'; setTimeout(() => t.remove(), 300); } }, 3000);
    },
    render: () => {} 
};

window.UI = UI;

window.switchTab = (tab) => { 
    UI.state.activeTab = tab;
    UI.state.selectedPersonId = null; 
    UI.state.editingRoleId = null;
    UI.render(); 
};

window.toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.style.setProperty('color-scheme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        html.style.setProperty('color-scheme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
};

window.updateApp = async () => {
    UI.showToast("Updating App...", "success");
    if ('serviceWorker' in navigator) {
        try { const regs = await navigator.serviceWorker.getRegistrations(); for (let r of regs) { await r.unregister(); } } catch(e) {}
    }
    setTimeout(() => { window.location.reload(true); }, 1000);
};

window.openModal = (key) => { UI.state.activeModal = key; UI.render(); };
window.closeModal = () => { UI.state.activeModal = null; UI.render(); };

export function getSeniorityName(id, state) {
    const s = state.data.seniorities.find(x => x.id === id);
    return s ? s.name : 'Unassigned';
}
window.getSeniorityName = getSeniorityName;

// Centralized generic UI classes for dense layout
export const css = {
    input: "w-full text-[16px] font-medium bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-colors shadow-sm",
    btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 shadow-sm outline-none flex items-center justify-center gap-2",
    btnSecondary: "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 shadow-sm outline-none flex items-center justify-center gap-2",
    btnDanger: "bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 shadow-sm outline-none flex items-center justify-center gap-2",
    card: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-md transition-colors",
    label: "text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block"
};