import { UI } from '../store.js';

export function SettingsDesktop(state) { return SharedSettingsForm(state); }
export function SettingsMobile(state) { return SharedSettingsForm(state); }

function SharedSettingsForm(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);
    const inputClass = "w-full text-base sm:text-lg font-bold bg-white dark:bg-[#18181b] border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white outline-none transition-colors shadow-sm dark:shadow-none min-h-[56px] focus:border-indigo-500 dark:focus:border-indigo-500";

    return `
    <div class="space-y-8 w-full max-w-4xl min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="mb-6"><h2 class="text-3xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide transition-colors">Advanced Settings</h2></div>

        <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-xl dark:shadow-2xl w-full min-w-0 transition-colors">
            <h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3 transition-colors"><i data-lucide="bar-chart" class="w-7 h-7 text-indigo-500 dark:text-indigo-400"></i> Seniority Tiers</h3>
            
            <div class="space-y-5 mb-8 w-full min-w-0">
                ${sortedSen.map(sen => `
                    <div class="bg-zinc-50 dark:bg-zinc-950 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 shadow-sm dark:shadow-inner w-full min-w-0 transition-colors">
                        <div class="flex gap-4 w-full mb-4 md:mb-5">
                            <div class="w-[80px] shrink-0 min-w-0">
                                <label class="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block truncate">Order</label>
                                <input type="number" id="senOrder_${sen.id}" value="${sen.order}" class="${inputClass} text-center px-2">
                            </div>
                            <div class="flex-1 min-w-0">
                                <label class="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block truncate">Name</label>
                                <input type="text" id="senName_${sen.id}" value="${sen.name}" class="${inputClass}">
                            </div>
                        </div>
                        <div class="flex gap-4 w-full">
                            <button onclick="window.handleUpdateSeniorityTier('${sen.id}')" class="flex-1 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white border border-zinc-700 dark:border-zinc-600 rounded-xl py-4 text-sm font-bold uppercase tracking-widest shadow-md outline-none transition-colors active:scale-95">Update</button>
                            <button onclick="window.handleDeleteSeniorityTier('${sen.id}')" class="w-16 shrink-0 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl py-4 flex items-center justify-center outline-none transition-colors active:scale-95 shadow-sm"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="pt-6 border-t border-zinc-200 dark:border-zinc-800 w-full min-w-0 transition-colors">
                <div class="flex gap-4 w-full mb-6">
                    <div class="flex-1 min-w-0">
                        <label class="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">New Tier</label>
                        <input type="text" id="newSenName" placeholder="Trainee" class="${inputClass}">
                    </div>
                    <div class="w-[80px] shrink-0 min-w-0">
                        <label class="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block truncate">Order</label>
                        <input type="number" id="newSenOrder" placeholder="4" class="${inputClass} text-center px-2">
                    </div>
                </div>
                <button onclick="window.handleAddSeniorityTier()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl text-base font-bold uppercase tracking-widest shadow-lg border border-indigo-500/50 outline-none transition-transform active:scale-95">Add Tier</button>
            </div>
        </div>

        <div class="bg-red-50 dark:bg-zinc-950 border-2 border-red-200 dark:border-red-500/30 rounded-[2rem] shadow-xl mt-10 w-full overflow-hidden min-w-0 transition-colors">
            <div class="p-5 md:p-6 bg-red-100/50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30 transition-colors"><h3 class="text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-base flex items-center gap-3"><i data-lucide="alert-triangle" class="w-6 h-6"></i> System Actions</h3></div>
            <div class="p-6 md:p-8 border-b border-red-200 dark:border-red-500/10 flex flex-col md:flex-row gap-6 justify-between items-center transition-colors">
                <div class="w-full md:flex-1"><h4 class="text-zinc-900 dark:text-white font-bold text-lg uppercase tracking-wide transition-colors">Initialize Schema</h4><p class="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed transition-colors">Run this only on an empty Google Sheet.</p></div>
                <button onclick="window.handleSetupDatabase()" class="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-sm font-bold border border-zinc-700 uppercase tracking-widest w-full md:w-auto shadow-md outline-none active:scale-95 transition-all">Run Setup</button>
            </div>
            <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-center transition-colors">
                <div class="w-full md:flex-1"><h4 class="text-zinc-900 dark:text-white font-bold text-lg uppercase tracking-wide transition-colors">Run Migration (v3)</h4><p class="text-sm mt-2 text-red-600 dark:text-red-400 font-bold leading-relaxed transition-colors">Warning: Clears existing Schedule.</p></div>
                <button onclick="window.handleRunMigration()" class="bg-orange-100 dark:bg-orange-500/10 hover:bg-orange-200 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-8 py-4 rounded-xl text-sm font-bold border border-orange-200 dark:border-orange-500/40 uppercase tracking-widest w-full md:w-auto shadow-md outline-none active:scale-95 transition-all">Execute</button>
            </div>
        </div>
    </div>
    `;
}

window.handleSetupDatabase = () => { if(confirm("Initialize schema?")) UI.dispatch('setupDatabase'); };
window.handleRunMigration = () => { if(confirm("Wipe schedule & migrate?")) UI.dispatch('runMigration'); };
window.handleAddSeniorityTier = () => {
    const name = document.getElementById('newSenName').value.trim(); const order = parseInt(document.getElementById('newSenOrder').value);
    if(!name || isNaN(order)) return UI.showToast("Provide Name and Order", "error"); UI.dispatch('addSeniorityTier', { name, order });
};
window.handleUpdateSeniorityTier = (id) => {
    const name = document.getElementById(`senName_${id}`).value.trim(); const order = parseInt(document.getElementById(`senOrder_${id}`).value);
    if(!name || isNaN(order)) return UI.showToast("Provide Name and Order", "error"); UI.dispatch('updateSeniorityTier', { id, name, order });
};
window.handleDeleteSeniorityTier = (id) => { if(confirm("Delete tier?")) UI.dispatch('deleteSeniorityTier', { id }); };