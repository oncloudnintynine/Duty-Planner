import { UI, getSeniorityName, css } from '../store.js';

export function ManageDesktop(state) { return ManageContainer(state, false); }
export function ManageMobile(state) { return ManageContainer(state, true); }

function ManageContainer(state, isMobile) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);
    const defaultSenId = sortedSen.length > 0 ? sortedSen[0].id : '';
    const searchQ = state.searchQuery.toLowerCase();
    const filteredPersonnel = state.data.personnel.filter(p => p.name.toLowerCase().includes(searchQ));
    const selPerson = state.data.personnel.find(p => p.id === state.selectedPersonId);

    const showList = !isMobile || (isMobile && !selPerson);
    const showDetail = !isMobile || (isMobile && !!selPerson);

    return `
    <div class="space-y-4 md:space-y-6 w-full h-full flex flex-col min-w-0 animate-in fade-in duration-300">
        
        ${showList ? `
        <div class="mb-1 shrink-0">
            <h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Personnel</h2>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage workforce and map capabilities.</p>
        </div>
        <div class="${css.card} p-4 flex flex-col xl:flex-row gap-4 shrink-0 w-full">
            <div class="flex flex-col sm:flex-row gap-3 w-full">
                <input type="text" id="inpNewPerson" class="${css.input}" placeholder="Person Name">
                <select id="inpNewSeniority" class="${css.input} sm:w-auto pr-10">
                    ${sortedSen.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                </select>
                <button onclick="window.handleAddPerson()" class="${css.btnPrimary} w-full sm:w-auto px-6">Add</button>
            </div>
            <div class="hidden xl:block w-px h-10 bg-zinc-200 dark:bg-zinc-700"></div>
            <div class="xl:hidden h-px w-full bg-zinc-200 dark:bg-zinc-800"></div>
            <div class="flex flex-col sm:flex-row gap-3 w-full">
                <input type="text" id="inpBulkPerson" class="${css.input}" placeholder="Bulk Import (comma sep.)">
                <button onclick="window.handleBulkImport('${defaultSenId}')" class="${css.btnSecondary} w-full sm:w-auto px-6">Import</button>
            </div>
        </div>
        ` : ''}

        <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 w-full min-w-0 h-full overflow-hidden">
            
            ${showList ? `
            <div class="w-full lg:w-[350px] xl:w-[400px] ${css.card} flex flex-col shrink-0 ${isMobile ? 'flex-1' : 'h-full'} overflow-hidden min-w-0">
                <div class="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
                    <div class="relative">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"></i>
                        <input type="text" id="searchPersonnel" placeholder="Search..." value="${state.searchQuery.replace(/"/g, '&quot;')}" oninput="UI.state.searchQuery = this.value; UI.render();" class="${css.input} pl-9 py-2">
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 hide-scroll">
                    ${filteredPersonnel.map(p => `
                        <button onclick="UI.state.selectedPersonId = '${p.id}'; UI.render();" class="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all outline-none ${state.selectedPersonId === p.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 shadow-sm' : 'bg-transparent border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}">
                            <div class="min-w-0 pr-3">
                                <div class="font-bold text-sm text-zinc-900 dark:text-white truncate">${p.name}</div>
                                <div class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-0.5">${getSeniorityName(p.seniority, state)}</div>
                            </div>
                            <i data-lucide="chevron-right" class="w-4 h-4 text-zinc-400 shrink-0"></i>
                        </button>
                    `).join('')}
                    ${filteredPersonnel.length === 0 ? `<div class="p-6 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg m-2">No matches</div>` : ''}
                </div>
            </div>
            ` : ''}

            ${showDetail ? `
            <div class="flex-1 ${css.card} flex flex-col w-full h-full overflow-hidden animate-in ${isMobile ? 'slide-in-from-right-4' : 'fade-in'} duration-300 min-w-0">
                ${!selPerson ? `
                    <div class="flex-1 flex flex-col items-center justify-center opacity-50 p-8 text-center">
                        <i data-lucide="user-square-2" class="w-16 h-16 mb-4 text-zinc-400"></i>
                        <p class="text-base font-bold uppercase tracking-widest text-zinc-400">Select personnel</p>
                    </div>
                ` : `
                    <div class="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
                        ${isMobile ? `<button onclick="window.clearSelection()" class="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white outline-none"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>` : ''}
                        <div class="flex-1 min-w-0">
                            <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate w-full">${selPerson.name}</h2>
                            <p class="text-[10px] text-zinc-500 font-mono font-medium mt-0.5">ID: ${selPerson.id.substring(0,8)}...</p>
                        </div>
                        <button onclick="UI.dispatch('deletePerson', {id: '${selPerson.id}'})" class="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors outline-none">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <div class="p-4 md:p-6 flex-1 overflow-y-auto space-y-6 hide-scroll w-full">
                        
                        <div class="bg-zinc-50 dark:bg-zinc-800/30 p-4 md:p-5 rounded-xl border border-zinc-200 dark:border-zinc-700/50 w-full">
                            <label class="${css.label} flex items-center gap-2 mb-3"><i data-lucide="award" class="w-4 h-4 text-indigo-500"></i> Seniority Level</label>
                            <div class="flex flex-col sm:flex-row gap-3 w-full lg:max-w-md">
                                <select id="editSeniority" class="${css.input}">
                                    ${sortedSen.map(s => `<option value="${s.id}" ${selPerson.seniority === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                                </select>
                                <button onclick="window.handleUpdateSeniority('${selPerson.id}', '${selPerson.name}')" class="${css.btnSecondary} w-full sm:w-auto px-6">Update</button>
                            </div>
                        </div>

                        <div class="bg-zinc-50 dark:bg-zinc-800/30 p-4 md:p-5 rounded-xl border border-zinc-200 dark:border-zinc-700/50 w-full">
                            <label class="${css.label} flex items-center gap-2 mb-3"><i data-lucide="shield" class="w-4 h-4 text-indigo-500"></i> Capabilities</label>
                            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 min-h-[100px] flex flex-wrap gap-2 shadow-sm">
                                ${state.data.tags.filter(t => t.personId === selPerson.id).map(t => {
                                    const role = state.data.roles.find(r => r.id === t.roleId);
                                    if(!role) return '';
                                    return `
                                    <div class="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-semibold">
                                        <span class="uppercase">${role.name}</span>
                                        <button onclick="UI.dispatch('deleteTag', {id: '${t.id}'})" class="w-6 h-6 rounded bg-indigo-100/50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors outline-none"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                                    </div>
                                    `;
                                }).join('') || `<div class="w-full text-center text-zinc-400 py-6 text-xs uppercase font-bold tracking-widest">No roles assigned.</div>`}
                            </div>
                            
                            <div class="mt-4 flex flex-col sm:flex-row gap-3 w-full lg:max-w-xl">
                                <select id="assignRoleSelect" class="${css.input}"><option value="">-- Select Capability --</option>${state.data.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
                                <button onclick="window.handleAssign('${selPerson.id}')" class="${css.btnPrimary} w-full sm:w-auto px-6">Grant Access</button>
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

window.clearSelection = () => { UI.state.selectedPersonId = null; UI.render(); };
window.handleAddPerson = () => {
    const val = document.getElementById('inpNewPerson').value.trim(); const seniority = document.getElementById('inpNewSeniority').value;
    if(!seniority) return UI.showToast("Setup Seniority Tiers in Advanced Settings first.", "error");
    if(val) UI.dispatch('addPerson', { personName: val, seniority: seniority });
};
window.handleUpdateSeniority = (id, name) => {
    const seniority = document.getElementById('editSeniority').value; UI.dispatch('updatePerson', { id, personName: name, seniority });
};
window.handleBulkImport = (defaultSenId) => {
    const val = document.getElementById('inpBulkPerson').value; const names = val.split(/\r?\n|,/).map(n=>n.trim()).filter(n=>n);
    if(!defaultSenId) return UI.showToast("Setup Seniority Tiers in Advanced Settings first.", "error");
    if(names.length > 0) UI.dispatch('importPersonnel', { names, defaultSeniority: defaultSenId });
};
window.handleAssign = (personId) => {
    const roleId = document.getElementById('assignRoleSelect').value; if(!roleId) return UI.showToast("Select a role to grant.", "error");
    UI.dispatch('tagPerson', { personId, roleId });
};