import { UI } from '../store.js';

export function AdvancedSettingsView(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);

    return `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl min-w-0">
        <div class="mb-4 shrink-0">
            <h2 class="text-2xl font-black text-white tracking-wide uppercase">Advanced Settings</h2>
            <p class="text-zinc-400 text-sm mt-1">Configure global application data and execute database operations.</p>
        </div>

        <!-- Seniority Tiers Manager -->
        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-6 shadow-xl mt-6 overflow-hidden w-full min-w-0">
            <h3 class="text-lg font-black text-white mb-2 flex items-center gap-2 uppercase tracking-wide"><i data-lucide="bar-chart" class="w-6 h-6 text-indigo-400"></i> Manage Seniority Tiers</h3>
            <p class="text-sm text-zinc-400 mb-6 leading-relaxed">Define the levels of seniority in your organization. Changes here automatically update personnel records, shift requirements, and the manpower calculator.</p>
            
            <div class="space-y-4 mb-6 w-full min-w-0">
                ${sortedSen.map(sen => `
                    <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-700/50 shadow-inner min-w-0">
                        <div class="flex flex-col w-20 shrink-0">
                            <label class="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">Order</label>
                            <input type="number" id="senOrder_${sen.id}" value="${sen.order}" class="w-full px-3 py-2 text-sm outline-none text-center bg-[#18181b] border border-zinc-600 rounded-lg font-bold">
                        </div>
                        <div class="flex-1 flex flex-col min-w-[120px]">
                            <label class="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">Tier Name</label>
                            <input type="text" id="senName_${sen.id}" value="${sen.name}" class="w-full px-4 py-2 text-sm outline-none bg-[#18181b] border border-zinc-600 rounded-lg font-bold">
                        </div>
                        <div class="flex items-end gap-3 mt-2 sm:mt-4 w-full sm:w-auto justify-end shrink-0">
                            <button onclick="window.handleUpdateSeniorityTier('${sen.id}')" class="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-lg px-6 py-3 sm:py-2 text-sm font-black transition-colors shadow-md outline-none">Update</button>
                            <button onclick="window.handleDeleteSeniorityTier('${sen.id}')" class="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 sm:py-2 transition-colors outline-none" title="Delete Tier"><i data-lucide="trash-2" class="w-5 h-5 sm:w-4 sm:h-4"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="pt-5 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 sm:items-end w-full min-w-0">
                <div class="flex-1 min-w-0">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-2 block">New Tier Name</label>
                    <input type="text" id="newSenName" placeholder="e.g. Trainee" class="w-full px-4 py-3 sm:py-2.5 text-sm outline-none bg-[#18181b] rounded-xl font-bold">
                </div>
                <div class="w-full sm:w-32 shrink-0">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-2 block">Sort Order</label>
                    <input type="number" id="newSenOrder" placeholder="e.g. 4" class="w-full px-4 py-3 sm:py-2.5 text-sm outline-none bg-[#18181b] rounded-xl font-bold text-center">
                </div>
                <button onclick="window.handleAddSeniorityTier()" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 sm:py-2.5 rounded-xl text-sm font-black transition-colors shadow-lg sm:h-[46px] uppercase tracking-wider outline-none">Add Tier</button>
            </div>
        </div>

        <!-- Database System Tools -->
        <div class="bg-red-500/5 border border-red-500/30 rounded-2xl overflow-hidden shadow-xl mt-8 w-full">
            <div class="p-4 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400"></i>
                <h3 class="text-red-400 font-black tracking-widest text-sm uppercase">System Database Operations</h3>
            </div>

            <div class="p-5 sm:p-6 border-b border-red-500/10 flex flex-col sm:flex-row gap-5 sm:items-center justify-between hover:bg-zinc-800/40 transition-colors">
                <div>
                    <h4 class="text-white font-black flex items-center gap-2 mb-1.5 text-base uppercase tracking-wide">
                        <i data-lucide="database-zap" class="w-5 h-5 text-zinc-300"></i> Initialize Database Schema
                    </h4>
                    <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">Creates all required missing sheets and headers. Run this only when connecting to a completely empty Google Sheet for the first time.</p>
                </div>
                <button onclick="window.handleSetupDatabase()" class="w-full sm:w-auto shrink-0 bg-zinc-800 text-white px-6 py-3.5 sm:py-3 rounded-xl text-sm font-black hover:bg-zinc-700 transition-colors border border-zinc-600 shadow-lg uppercase tracking-wider outline-none">
                    Run Setup
                </button>
            </div>

            <div class="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center justify-between hover:bg-zinc-800/40 transition-colors">
                <div>
                    <h4 class="text-white font-black flex items-center gap-2 mb-1.5 text-base uppercase tracking-wide">
                        <i data-lucide="file-up" class="w-5 h-5 text-orange-400"></i> Run Data Migration (v3)
                    </h4>
                    <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">Upgrades existing data to support fully dynamic Seniority Tiers. <span class="text-red-400 font-bold">Warning: This will clear existing Schedule generation.</span></p>
                </div>
                <button onclick="window.handleRunMigration()" class="w-full sm:w-auto shrink-0 bg-orange-500/10 text-orange-400 px-6 py-3.5 sm:py-3 rounded-xl text-sm font-black hover:bg-orange-500/20 transition-colors border border-orange-500/40 shadow-lg uppercase tracking-wider outline-none">
                    Execute Migration
                </button>
            </div>
        </div>
    </div>
    `;
}

// BIND LOGIC
window.handleSetupDatabase = () => {
    if(confirm("WARNING: Are you sure you want to initialize the database schema? Do this only on an empty Google Sheet.")) {
        UI.dispatch('setupDatabase');
    }
};

window.handleRunMigration = () => {
    if(confirm("WARNING: This will upgrade the schema and permanently WIPE the existing schedule data. Proceed?")) {
        UI.dispatch('runMigration');
    }
};

window.handleAddSeniorityTier = () => {
    const name = document.getElementById('newSenName').value.trim();
    const order = parseInt(document.getElementById('newSenOrder').value);
    if(!name || isNaN(order)) return UI.showToast("Provide both Name and numerical Sort Order", "error");
    UI.dispatch('addSeniorityTier', { name, order });
};

window.handleUpdateSeniorityTier = (id) => {
    const name = document.getElementById(`senName_${id}`).value.trim();
    const order = parseInt(document.getElementById(`senOrder_${id}`).value);
    if(!name || isNaN(order)) return UI.showToast("Provide both Name and numerical Sort Order", "error");
    UI.dispatch('updateSeniorityTier', { id, name, order });
};

window.handleDeleteSeniorityTier = (id) => {
    if(confirm("Delete this tier? Personnel with this tier will be unassigned. Shift headcount required for this tier will be deleted permanently.")) {
        UI.dispatch('deleteSeniorityTier', { id });
    }
};