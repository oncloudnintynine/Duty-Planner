import { API } from './api.js';

export const UI = {
    state: {
        isMobile: window.innerWidth < 1024, // Separation Breakpoint
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
        
        // Listen for screen size changes to switch UI Paradigms dynamically
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
                
                if (action === 'deletePerson' && payload.id === this.state.selectedPersonId) {
                    this.state.selectedPersonId = null;
                }
                if (action === 'updateRole' || action === 'addRole') {
                    this.state.editingRoleId = null;
                }
                if (action === 'deleteRole' && payload.id === this.state.editingRoleId) {
                    this.state.editingRoleId = null;
                }
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
        <div id="toast-container" class="fixed top-safe pt-4 left-1/2 -translate-x-1/2 lg:top-auto lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0 z-[200] animate-in slide-in-from-top-8 lg:slide-in-from-bottom-8 fade-in duration-300 w-[92%] lg:w-auto max-w-md">
            <div class="${isErr ? 'bg-red-500 text-white' : 'bg-white text-zinc-900'} px-5 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 border ${isErr ? 'border-red-400' : 'border-zinc-200'}">
                <i data-lucide="${isErr ? 'alert-octagon' : 'check-circle'}" class="w-6 h-6 shrink-0 ${isErr ? 'text-white' : 'text-emerald-500'}"></i>
                <span class="flex-1 leading-relaxed">${msg}</span>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        if (window.lucide) window.lucide.createIcons();
        
        setTimeout(() => {
            const t = document.getElementById('toast-container');
            if (t) {
                t.style.opacity = '0';
                t.style.transition = 'opacity 0.3s ease';
                setTimeout(() => t.remove(), 300);
            }
        }, 3000);
    },
    
    render: () => {} // Bound in app.js
};

// Global Handlers
window.UI = UI;

window.switchTab = (tab) => { 
    UI.state.activeTab = tab;
    UI.state.selectedPersonId = null; 
    UI.state.editingRoleId = null;
    UI.render(); 
};

window.openModal = (key) => { UI.state.activeModal = key; UI.render(); };
window.closeModal = () => { UI.state.activeModal = null; UI.render(); };

export function getSeniorityName(id, state) {
    const s = state.data.seniorities.find(x => x.id === id);
    return s ? s.name : 'Unassigned';
}