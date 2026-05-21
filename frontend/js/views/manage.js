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

    // On mobile, if a person is selected, hide the top bar and list. Use Master-Detail flow.
    const showList = !isMobile || (isMobile && !selPerson);
    const showDetail = !isMobile || (isMobile && !!selPerson);

    return `
    <div class="space-y-6 w-full h-full flex flex-col">
        
        ${showList ? `
        <div class="mb-2 shrink-0">
            <h2 class="text-2xl font-black text-white uppercase">Personnel</h2>
        </div>
        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex flex-col xl:flex-row gap-5 shadow-xl shrink-0 w-full">
            <div class="flex flex-col sm:flex-row gap-3 w-full">
                <input type="text" id="inpNewPerson" class="flex-1" placeholder="Add single person">
                <select id="inpNewSeniority" class="w-full sm:w-auto">${sortedSen.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
                <button onclick="window.handleAddPerson()" class="bg-indigo-600 text-white px-8 py-4 sm:py-3 rounded-xl font-black uppercase">Add</button>
            </div>
        </div>
        ` : ''}

        <div class="flex flex-col lg:flex-row gap-6 flex-1 w-full">
            
            ${showList ? `
            <!-- LIST VIEW -->
            <div class="w-full lg:w-1/3 bg-zinc-900 border border-zinc-700 rounded-2xl flex flex-col shadow-xl shrink-0 ${isMobile ? 'h-[65vh]' : 'h-[60vh]'} overflow-hidden">
                <div class="p-4 border-b border-zinc-800 bg-zinc-800/80">
                    <input type="text" id="searchPersonnel" placeholder="Search personnel..." value="${state.searchQuery.replace(/"/g, '&quot;')}" oninput="UI.state.searchQuery = this.value; UI.render();" class="w-full">
                </div>
                <div class="flex-1 overflow-y-auto p-3 space-y-2">
                    ${filteredPersonnel.map(p => `
                        <button onclick="UI.state.selectedPersonId = '${p.id}'; UI.render();" class="w-full text-left px-5 py-4 rounded-xl flex items-center justify-between transition-all ${state.selectedPersonId === p.id ? 'bg-indigo-500/20 border border-indigo-500/50' : 'bg-zinc-900 border border-zinc-800'}">
                            <div class="truncate">
                                <div class="font-black text-base text-zinc-200 truncate">${p.name}</div>
                                <div class="text-[10px] uppercase font-black text-zinc-500 mt-1">${getSeniorityName(p.seniority, state)}</div>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-indigo-400 shrink-0"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${showDetail ? `
            <!-- DETAIL VIEW -->
            <div class="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex flex-col w-full h-full lg:min-h-[500px]">
                ${!selPerson ? `
                    <div class="flex-1 flex flex-col items-center justify-center opacity-40 p-6 text-center h-[500px]">
                        <i data-lucide="user-square-2" class="w-24 h-24 mb-6"></i>
                        <p class="text-xl font-black uppercase text-zinc-400">Select personnel</p>
                    </div>
                ` : `
                    <div class="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
                        <div class="w-full sm:w-auto">
                            ${isMobile ? `<button onclick="window.clearSelection()" class="mb-4 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 w-full justify-center"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back to List</button>` : ''}
                            <h2 class="text-2xl font-black text-white truncate w-full">${selPerson.name}</h2>
                        </div>
                        <button onclick="UI.dispatch('deletePerson', {id: '${selPerson.id}'})" class="w-full sm:w-auto bg-red-500/10 text-red-400 px-5 py-4 sm:py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2">
                            <i data-lucide="trash-2" class="w-5 h-5"></i> Delete User
                        </button>
                    </div>

                    <div class="p-5 sm:p-8 flex-1 overflow-y-auto space-y-8 bg-zinc-950/20">
                        
                        <div class="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 w-full">
                            <label class="block text-xs font-black text-zinc-400 mb-4 uppercase">Seniority Level</label>
                            <div class="flex flex-col sm:flex-row gap-4 w-full">
                                <select id="editSeniority" class="w-full text-indigo-300">
                                    ${sortedSen.map(s => `<option value="${s.id}" ${selPerson.seniority === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                                </select>
                                <button onclick="window.handleUpdateSeniority('${selPerson.id}', '${selPerson.name}')" class="bg-zinc-800 text-white px-8 py-4 sm:py-3 rounded-xl font-black text-sm uppercase w-full sm:w-auto border border-zinc-600">Update</button>
                            </div>
                        </div>

                        <div class="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 w-full">
                            <label class="block text-xs font-black text-zinc-400 uppercase mb-4 border-b border-zinc-800 pb-3">Capabilities</label>
                            <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-5 min-h-[140px] flex flex-wrap gap-3">
                                ${state.data.tags.filter(t => t.personId === selPerson.id).map(t => {
                                    const role = state.data.roles.find(r => r.id === t.roleId);
                                    if(!role) return '';
                                    return `
                                    <div class="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 pl-4 pr-2 py-2 rounded-xl text-sm font-bold">
                                        <span class="uppercase">${role.name}</span>
                                        <button onclick="UI.dispatch('deleteTag', {id: '${t.id}'})" class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center"><i data-lucide="x" class="w-4 h-4"></i></button>
                                    </div>
                                    `;
                                }).join('') || `<div class="w-full text-center text-zinc-500 py-6 uppercase font-black text-xs">No roles assigned.</div>`}
                            </div>
                            
                            <div class="mt-5 flex flex-col sm:flex-row gap-4 w-full">
                                <select id="assignRoleSelect" class="w-full"><option value="">-- Select Capability --</option>${state.data.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
                                <button onclick="window.handleAssign('${selPerson.id}')" class="bg-indigo-600 text-white px-8 py-4 sm:py-3 rounded-xl text-sm font-black w-full sm:w-auto uppercase">Grant Access</button>
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