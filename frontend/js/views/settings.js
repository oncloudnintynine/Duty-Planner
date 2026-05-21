import { UI } from '../store.js';

export function SettingsDesktop(state) { return SharedSettingsForm(state); }
export function SettingsMobile(state) { return SharedSettingsForm(state); }

function SharedSettingsForm(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);

    return `
    <div class="space-y-8 w-full max-w-4xl min-w-0">
        <div class="mb-6"><h2 class="text-3xl font-black text-white uppercase tracking-wide">Advanced Settings</h2></div>

        <div class="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-2xl w-full min-w-0">
            <h3 class="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3"><i data-lucide="bar-chart" class="w-7 h-7 text-indigo-400"></i> Seniority Tiers</h3>
            
            <div class="space-y-5 mb-8 w-full min-w-0">
                ${sortedSen.map(sen => `
                    <div class="bg-zinc-950 p-5 md:p-6 rounded-2xl border border-zinc-800 shadow-inner w-full min-w-0">
                        <div class="grid grid-cols-4 gap-4 w-full mb-5">
                            <div class="col-span-1 min-w-0">
                                <label class="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block truncate">Order</label>
                                <input type="number" id="senOrder_${sen.id}" value="${sen.order}" class="w-full text-center font-bold text-lg bg-[#18181b] border-none px-2 py-4 outline-none">
                            </div>
                            <div class="col-span-3 min-w-0">
                                <label class="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block truncate">Name</label>
                                <input type="text" id="senName_${sen.id}" value="${sen.name}" class="w-full font-bold text-lg bg-[#18181b] border-none px-4 py-4 outline-none">
                            </div>
                        </div>
                        <div class="flex gap-4 w-full">
                            <button onclick="window.handleUpdateSeniorityTier('${sen.id}')" class="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-xl py-4 text-sm font-bold uppercase tracking-widest shadow-md outline-none">Update</button>
                            <button onclick="window.handleDeleteSeniorityTier('${sen.id}')" class="w-16 shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-4 flex items-center justify-center outline-none"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="pt-6 border-t border-zinc-800 w-full min-w-0">
                <div class="grid grid-cols-4 gap-4 w-full mb-6">
                    <div class="col-span-3 min-w-0">
                        <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block">New Tier</label>
                        <input type="text" id="newSenName" placeholder="Trainee" class="w-full font-bold text-lg bg-[#18181b] border border-zinc-700 px-4 py-4 outline-none focus:border-indigo-500 rounded-xl">
                    </div>
                    <div class="col-span-1 min-w-0">
                        <label class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2 block truncate">Order</label>
                        <input type="number" id="newSenOrder" placeholder="4" class="w-full font-bold text-lg text-center bg-[#18181b] border border-zinc-700 px-2 py-4 outline-none focus:border-indigo-500 rounded-xl">
                    </div>
                </div>
                <button onclick="window.handleAddSeniorityTier()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl text-base font-bold uppercase tracking-widest shadow-lg border border-indigo-500/50 outline-none">Add Tier</button>
            </div>
        </div>

        <div class="bg-zinc-950 border border-red-500/30 rounded-3xl shadow-xl mt-10 w-full overflow-hidden min-w-0">
            <div class="p-5 md:p-6 bg-red-500/10 border-b border-red-500/30"><h3 class="text-red-400 font-bold uppercase tracking-widest text-base flex items-center gap-3"><i data-lucide="alert-triangle" class="w-6 h-6"></i> System Actions</h3></div>
            <div class="p-6 md:p-8 border-b border-red-500/10 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div class="w-full md:flex-1"><h4 class="text-white font-bold text-lg uppercase tracking-wide">Initialize Schema</h4><p class="text-sm text-zinc-400 mt-2 leading-relaxed">Run this only on an empty Google Sheet.</p></div>
                <button onclick="window.handleSetupDatabase()" class="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-sm font-bold border border-zinc-600 uppercase tracking-widest w-full md:w-auto shadow-md outline-none">Run Setup</button>
            </div>
            <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div class="w-full md:flex-1"><h4 class="text-white font-bold text-lg uppercase tracking-wide">Run Migration (v3)</h4><p class="text-sm mt-2 text-red-400 font-bold leading-relaxed">Warning: Clears existing Schedule.</p></div>
                <button onclick="window.handleRunMigration()" class="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-8 py-4 rounded-xl text-sm font-bold border border-orange-500/40 uppercase tracking-widest w-full md:w-auto shadow-md outline-none">Execute</button>
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