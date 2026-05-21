import { UI, getSeniorityName } from '../store.js';

export function ManageDesktop(state) {
    return ManageContainer(state, false);
}

export function ManageMobile(state) {
    return ManageContainer(state, true);
}

function ManageContainer(state, isMobile) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);
    const defaultSenId = sortedSen.length > 0 ? sortedSen[0].id : '';
    const searchQ = state.searchQuery.toLowerCase();
    const filteredPersonnel = state.data.personnel.filter(p => p.name.toLowerCase().includes(searchQ));
    const selPerson = state.data.personnel.find(p => p.id === state.selectedPersonId);

    // On mobile, if a person is selected, hide the top bar and list. Master-Detail pattern.
    const showList = !isMobile || (isMobile && !selPerson);
    const showDetail = !isMobile || (isMobile && !!selPerson);

    return `
    <div class="space-y-6 w-full h-full flex flex-col min-w-0">
        
        ${showList ? `
        <div class="mb-4 shrink-0">
            <h2 class="text-3xl font-black text-white uppercase tracking-wide">Personnel</h2>
        </div>
        <div class="bg-zinc-900 border border-zinc-700 rounded-3xl p-5 md:p-6 flex flex-col xl:flex-row gap-6 shadow-2xl shrink-0 w-full min-w-0">
            <div class="flex flex-col sm:flex-row gap-4 w-full">
                <input type="text" id="inpNewPerson" class="flex-1 text-lg font-bold" placeholder="Add single person">
                <select id="inpNewSeniority" class="w-full sm:w-auto text-base font-bold">${sortedSen.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
                <button onclick="window.handleAddPerson()" class="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-md">Add</button>
            </div>
            <div class="hidden xl:block w-px h-12 bg-zinc-700"></div>
            <div class="xl:hidden h-px w-full bg-zinc-800"></div>
            <div class="flex flex-col sm:flex-row gap-4 w-full">
                <input type="text" id="inpBulkPerson" class="flex-1 text-lg font-bold" placeholder="Bulk Import (comma separated)">
                <button onclick="window.handleBulkImport('${defaultSenId}')" class="bg-zinc-800 text-zinc-200 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm border border-zinc-600 shadow-md">Import</button>
            </div>
        </div>
        ` : ''}

        <div class="flex flex-col lg:flex-row gap-8 flex-1 w-full pb-6 lg:pb-0 min-w-0 mt-2">
            
            ${showList ? `
            <!-- LIST VIEW -->
            <div class="w-full lg:w-1/3 bg-zinc-900 border border-zinc-700 rounded-3xl flex flex-col shadow-2xl shrink-0 ${isMobile ? 'h-[65vh]' : 'h-[60vh]'} overflow-hidden min-w-0">
                <div class="p-5 border-b border-zinc-800 bg-zinc-800/80">
                    <div class="relative">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"></i>
                        <input type="text" id="searchPersonnel" placeholder="Search personnel..." value="${state.searchQuery.replace(/"/g, '&quot;')}" oninput="UI.state.searchQuery = this.value; UI.render();" class="w-full pl-12 text-base font-bold bg-[#18181b] border-none shadow-inner">
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/30 hide-scroll">
                    ${filteredPersonnel.map(p => `
                        <button onclick="UI.state.selectedPersonId = '${p.id}'; UI.render();" class="w-full text-left px-5 py-4 rounded-2xl flex items-center justify-between transition-all ${state.selectedPersonId === p.id ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-md transform scale-[1.02]' : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80'} outline-none">
                            <div class="min-w-0 pr-3">
                                <div class="font-black text-lg text-zinc-200 break-words whitespace-normal leading-tight">${p.name}</div>
                                <div class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-zinc-500 mt-2">${getSeniorityName(p.seniority, state)}</div>
                            </div>
                            <i data-lucide="chevron-right" class="w-6 h-6 text-indigo-400 shrink-0"></i>
                        </button>
                    `).join('')}
                    ${filteredPersonnel.length === 0 ? `<div class="p-8 text-center text-zinc-500 text-sm font-black uppercase tracking-widest border border-dashed border-zinc-800 rounded-2xl m-2">No matches found.</div>` : ''}
                </div>
            </div>
            ` : ''}

            ${showDetail ? `
            <!-- DETAIL VIEW -->
            <div class="flex-1 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl flex flex-col w-full h-full lg:min-h-[600px] overflow-hidden animate-in ${isMobile ? 'slide-in-from-right-4' : 'fade-in'} duration-300 min-w-0">
                ${!selPerson ? `
                    <div class="flex-1 flex flex-col items-center justify-center opacity-40 p-8 text-center h-[500px]">
                        <i data-lucide="user-square-2" class="w-24 h-24 mb-6"></i>
                        <p class="text-xl font-black uppercase tracking-widest text-zinc-400">Select personnel to configure</p>
                    </div>
                ` : `
                    <div class="p-6 md:p-8 border-b border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-5 shrink-0 bg-zinc-800/50">
                        <div class="w-full sm:w-auto min-w-0">
                            ${isMobile ? `<button onclick="window.clearSelection()" class="mb-5 text-indigo-400 bg-indigo-500/10 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full border border-indigo-500/30"><i data-lucide="arrow-left" class="w-5 h-5"></i> Back to List</button>` : ''}
                            <h2 class="text-3xl font-black text-white break-words whitespace-normal leading-tight w-full">${selPerson.name}</h2>
                            <p class="text-xs text-zinc-500 font-mono font-bold uppercase tracking-widest mt-2">Sys ID: ${selPerson.id.substring(0,8)}...</p>
                        </div>
                        <button onclick="UI.dispatch('deletePerson', {id: '${selPerson.id}'})" class="w-full sm:w-auto bg-red-500/10 text-red-400 px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/30 shrink-0">
                            <i data-lucide="trash-2" class="w-5 h-5"></i> Delete User
                        </button>
                    </div>

                    <div class="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 bg-zinc-950/20 hide-scroll min-w-0">
                        
                        <div class="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-700 shadow-xl w-full">
                            <label class="block text-sm font-black text-zinc-400 mb-5 uppercase tracking-widest flex items-center gap-3 border-b border-zinc-800 pb-4"><i data-lucide="award" class="w-6 h-6 text-indigo-400"></i> Seniority Level</label>
                            <div class="flex flex-col sm:flex-row gap-5 w-full lg:max-w-md">
                                <select id="editSeniority" class="w-full text-indigo-300 font-black text-lg bg-[#18181b] border-zinc-600">
                                    ${sortedSen.map(s => `<option value="${s.id}" ${selPerson.seniority === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                                </select>
                                <button onclick="window.handleUpdateSeniority('${selPerson.id}', '${selPerson.name}')" class="bg-zinc-800 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest w-full sm:w-auto border border-zinc-600 shadow-md">Update</button>
                            </div>
                        </div>

                        <div class="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-700 shadow-xl w-full">
                            <label class="block text-sm font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4"><i data-lucide="shield" class="w-6 h-6 text-indigo-400"></i> Capabilities</label>
                            <div class="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 min-h-[160px] flex flex-wrap gap-4 shadow-inner">
                                ${state.data.tags.filter(t => t.personId === selPerson.id).map(t => {
                                    const role = state.data.roles.find(r => r.id === t.roleId);
                                    if(!role) return '';
                                    return `
                                    <div class="inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 pl-5 pr-2.5 py-2.5 rounded-xl text-sm font-bold shadow-sm break-words whitespace-normal leading-snug">
                                        <span class="uppercase tracking-wider">${role.name}</span>
                                        <button onclick="UI.dispatch('deleteTag', {id: '${t.id}'})" class="w-10 h-10 shrink-0 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                                    </div>
                                    `;
                                }).join('') || `<div class="w-full text-center text-zinc-500 py-8 flex flex-col items-center justify-center opacity-50"><i data-lucide="ghost" class="w-12 h-12 mb-3"></i><span class="uppercase font-black text-xs tracking-widest">No roles assigned.</span></div>`}
                            </div>
                            
                            <div class="mt-6 flex flex-col sm:flex-row gap-5 w-full lg:max-w-xl">
                                <select id="assignRoleSelect" class="w-full font-black text-lg bg-[#18181b] border-zinc-600"><option value="">-- Select Capability --</option>${state.data.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
                                <button onclick="window.handleAssign('${selPerson.id}')" class="bg-indigo-600 text-white px-8 py-4 rounded-xl text-sm font-black w-full sm:w-auto uppercase tracking-widest shadow-lg shrink-0 border border-indigo-500/50">Grant Access</button>
                            </div>
                        </div>
                    </div>
                `}
            </div>
            ` : ''}
        </div>
    </div>
    `;
}

// BIND LOGIC
window.clearSelection = () => { UI.state.selectedPersonId = null; UI.render(); };
window.handleAddPerson = () => {
    const val = document.getElementById('inpNewPerson').value.trim();
    const seniority = document.getElementById('inpNewSeniority').value;
    if(!seniority) return UI.showToast("Setup Seniority Tiers in Advanced Settings first.", "error");
    if(val) UI.dispatch('addPerson', { personName: val, seniority: seniority });
};
window.handleUpdateSeniority = (id, name) => {
    const seniority = document.getElementById('editSeniority').value;
    UI.dispatch('updatePerson', { id, personName: name, seniority });
};
window.handleBulkImport = (defaultSenId) => {
    const val = document.getElementById('inpBulkPerson').value;
    const names = val.split(/\r?\n|,/).map(n=>n.trim()).filter(n=>n);
    if(!defaultSenId) return UI.showToast("Setup Seniority Tiers in Advanced Settings first.", "error");
    if(names.length > 0) UI.dispatch('importPersonnel', { names, defaultSeniority: defaultSenId });
};
window.handleAssign = (personId) => {
    const roleId = document.getElementById('assignRoleSelect').value;
    if(!roleId) return UI.showToast("Select a role to grant.", "error");
    UI.dispatch('tagPerson', { personId, roleId });
};