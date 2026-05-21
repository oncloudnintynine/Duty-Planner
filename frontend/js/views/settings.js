import { UI } from '../store.js';

export function SettingsDesktop(state) { return SharedSettingsForm(state); }
export function SettingsMobile(state) { return SharedSettingsForm(state); }

function SharedSettingsForm(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);

    return `
    <div class="space-y-6 w-full max-w-4xl">
        <div class="mb-4"><h2 class="text-2xl font-black text-white uppercase">Advanced Settings</h2></div>

        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-xl w-full">
            <h3 class="text-lg font-black text-white mb-6 uppercase flex items-center gap-2"><i data-lucide="bar-chart" class="w-6 h-6 text-indigo-400"></i> Seniority Tiers</h3>
            
            <div class="space-y-4 mb-6 w-full">
                ${sortedSen.map(sen => `
                    <div class="flex flex-col sm:flex-row gap-4 bg-zinc-950 p-5 rounded-xl border border-zinc-700/50 w-full">
                        <div class="flex gap-4 w-full sm:flex-1">
                            <div class="flex flex-col w-20 shrink-0"><label class="text-[10px] text-zinc-500 uppercase font-black mb-2">Order</label><input type="number" id="senOrder_${sen.id}" value="${sen.order}" class="text-center font-bold"></div>
                            <div class="flex-1 flex flex-col"><label class="text-[10px] text-zinc-500 uppercase font-black mb-2">Name</label><input type="text" id="senName_${sen.id}" value="${sen.name}" class="font-bold"></div>
                        </div>
                        <div class="flex gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 items-end">
                            <button onclick="window.handleUpdateSeniorityTier('${sen.id}')" class="flex-1 sm:flex-none bg-zinc-800 text-white border border-zinc-600 rounded-xl px-6 py-4 sm:py-3 text-sm font-black uppercase">Update</button>
                            <button onclick="window.handleDeleteSeniorityTier('${sen.id}')" class="bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl px-5 py-4 sm:py-3"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="pt-5 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 w-full">
                <div class="flex-1"><label class="text-[10px] text-zinc-400 uppercase font-black mb-2 block">New Tier</label><input type="text" id="newSenName" placeholder="Trainee" class="font-bold"></div>
                <div class="w-full sm:w-28 shrink-0"><label class="text-[10px] text-zinc-400 uppercase font-black mb-2 block">Order</label><input type="number" id="newSenOrder" placeholder="4" class="font-bold text-center"></div>
                <div class="w-full sm:w-auto flex items-end"><button onclick="window.handleAddSeniorityTier()" class="w-full bg-indigo-600 text-white px-8 py-4 sm:py-[15px] rounded-xl text-sm font-black uppercase">Add</button></div>
            </div>
        </div>

        <div class="bg-red-500/5 border border-red-500/30 rounded-2xl shadow-xl mt-8 w-full overflow-hidden">
            <div class="p-4 bg-red-500/10 border-b border-red-500/30"><h3 class="text-red-400 font-black uppercase text-sm flex items-center gap-2"><i data-lucide="alert-triangle" class="w-5 h-5"></i> Database Operations</h3></div>
            <div class="p-6 border-b border-red-500/10 flex flex-col sm:flex-row gap-5 justify-between">
                <div><h4 class="text-white font-black text-base uppercase">Initialize Schema</h4><p class="text-sm text-zinc-400 mt-1">Run this only on an empty Google Sheet.</p></div>
                <button onclick="window.handleSetupDatabase()" class="bg-zinc-800 text-white px-6 py-4 rounded-xl text-sm font-black border border-zinc-600 uppercase">Run Setup</button>
            </div>
            <div class="p-6 flex flex-col sm:flex-row gap-5 justify-between">
                <div><h4 class="text-white font-black text-base uppercase">Run Migration (v3)</h4><p class="text-sm text-zinc-400 mt-1 text-red-400">Warning: Clears existing Schedule.</p></div>
                <button onclick="window.handleRunMigration()" class="bg-orange-500/10 text-orange-400 px-6 py-4 rounded-xl text-sm font-black border border-orange-500/40 uppercase">Execute</button>
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