import { UI, css } from '../store.js';

export function SettingsDesktop(state) { return SharedSettingsForm(state); }
export function SettingsMobile(state) { return SharedSettingsForm(state); }

function SharedSettingsForm(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);

    return `
    <div class="space-y-6 w-full max-w-3xl min-w-0 animate-in fade-in duration-300">
        <div class="mb-4"><h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Advanced Settings</h2></div>

        <div class="${css.card} p-5 md:p-6 w-full min-w-0">
            <h3 class="text-base font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2"><i data-lucide="bar-chart" class="w-5 h-5 text-indigo-500"></i> Seniority Tiers</h3>
            
            <div class="space-y-4 mb-6 w-full min-w-0">
                ${sortedSen.map(sen => `
                    <div class="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full min-w-0">
                        <div class="grid grid-cols-12 gap-3 w-full mb-3">
                            <div class="col-span-4 sm:col-span-2 min-w-0">
                                <label class="${css.label} truncate">Order</label>
                                <input type="number" id="senOrder_${sen.id}" value="${sen.order}" class="${css.input} text-center px-1">
                            </div>
                            <div class="col-span-8 sm:col-span-6 min-w-0">
                                <label class="${css.label} truncate">Name</label>
                                <input type="text" id="senName_${sen.id}" value="${sen.name}" class="${css.input}">
                            </div>
                            <div class="col-span-12 sm:col-span-4 flex items-end gap-2 w-full mt-1 sm:mt-0">
                                <button onclick="window.handleUpdateSeniorityTier('${sen.id}')" class="${css.btnSecondary} flex-1 px-2"><i data-lucide="save" class="w-4 h-4"></i></button>
                                <button onclick="window.handleDeleteSeniorityTier('${sen.id}')" class="${css.btnDanger} px-3"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="pt-5 border-t border-zinc-200 dark:border-zinc-800 w-full min-w-0">
                <div class="grid grid-cols-12 gap-3 w-full mb-4">
                    <div class="col-span-8 sm:col-span-8 min-w-0">
                        <label class="${css.label}">New Tier</label>
                        <input type="text" id="newSenName" placeholder="Trainee" class="${css.input}">
                    </div>
                    <div class="col-span-4 sm:col-span-4 min-w-0">
                        <label class="${css.label} truncate">Order</label>
                        <input type="number" id="newSenOrder" placeholder="4" class="${css.input} text-center px-1">
                    </div>
                </div>
                <button onclick="window.handleAddSeniorityTier()" class="${css.btnPrimary} w-full py-3">Add Tier</button>
            </div>
        </div>

        <div class="bg-red-50 dark:bg-zinc-950 border border-red-200 dark:border-red-500/30 rounded-xl mt-8 w-full overflow-hidden min-w-0">
            <div class="p-4 bg-red-100/50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30"><h3 class="text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4"></i> System Actions</h3></div>
            <div class="p-5 border-b border-red-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div class="w-full md:flex-1"><h4 class="text-zinc-900 dark:text-white font-bold text-sm uppercase">Initialize Schema</h4><p class="text-xs text-zinc-500 mt-1">Run this only on an empty Google Sheet.</p></div>
                <button onclick="window.handleSetupDatabase()" class="${css.btnSecondary} w-full md:w-auto px-6">Run Setup</button>
            </div>
            <div class="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div class="w-full md:flex-1"><h4 class="text-zinc-900 dark:text-white font-bold text-sm uppercase">Run Migration (v3)</h4><p class="text-xs mt-1 text-red-500 font-semibold">Warning: Clears existing Schedule.</p></div>
                <button onclick="window.handleRunMigration()" class="${css.btnDanger} w-full md:w-auto px-6">Execute</button>
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