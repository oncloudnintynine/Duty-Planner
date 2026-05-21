import { UI, getSeniorityName } from '../store.js';

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

    const inputClass = "w-full text-base sm:text-lg font-bold bg-white dark:bg-[#18181b] border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-colors shadow-sm dark:shadow-none min-h-[56px]";

    return `
    <div class="space-y-6 w-full h-full flex flex-col min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        ${showList ? `
        <div class="mb-2 shrink-0">
            <h2 class="text-3xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide transition-colors">Personnel</h2>
            <p class="text-zinc-500 dark:text-zinc-400 text-base mt-2 transition-colors">Manage workforce, update seniority levels, and map capabilities.</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 md:p-8 flex flex-col xl:flex-row gap-6 shadow-xl dark:shadow-2xl shrink-0 w-full min-w-0 transition-colors">
            <div class="flex flex-col sm:flex-row gap-4 w-full">
                <input type="text" id="inpNewPerson" class="${inputClass}" placeholder="Add single person">
                <select id="inpNewSeniority" class="${inputClass} sm:w-auto pr-12">
                    ${sortedSen.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                </select>
                <button onclick="window.handleAddPerson()" class="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-base shadow-lg outline-none active:scale-95 transition-transform min-h-[56px] border border-indigo-500">Add</button>
            </div>
            <div class="hidden xl:block w-px h-14 bg-zinc-200 dark:bg-zinc-700 transition-colors"></div>
            <div class="xl:hidden h-px w-full bg-zinc-200 dark:bg-zinc-800 transition-colors"></div>
            <div class="flex flex-col sm:flex-row gap-4 w-full">
                <input type="text" id="inpBulkPerson" class="${inputClass}" placeholder="Bulk Import (comma separated)">
                <button onclick="window.handleBulkImport('${defaultSenId}')" class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-base border-2 border-zinc-300 dark:border-zinc-600 shadow-sm outline-none active:scale-95 transition-all min-h-[56px]">Import</button>
            </div>
        </div>
        ` : ''}

        <div class="flex flex-col lg:flex-row gap-8 flex-1 w-full pb-6 lg:pb-0 min-w-0 mt-2 h-full">
            
            ${showList ? `
            <!-- LIST VIEW -->
            <div class="w-full lg:w-[400px] xl:w-[450px] bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] flex flex-col shadow-xl shrink-0 ${isMobile ? 'flex-1' : 'h-[65vh]'} overflow-hidden min-w-0 transition-colors">
                <div class="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0 transition-colors">
                    <div class="relative">
                        <i data-lucide="search" class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 dark:text-zinc-500"></i>
                        <input type="text" id="searchPersonnel" placeholder="Search personnel..." value="${state.searchQuery.replace(/"/g, '&quot;')}" oninput="UI.state.searchQuery = this.value; UI.render();" class="w-full pl-14 pr-5 py-4 text-lg font-bold bg-white dark:bg-[#18181b] border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm dark:shadow-inner text-zinc-900 dark:text-white outline-none focus:border-indigo-500 min-h-[56px] transition-colors">
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/30 hide-scroll w-full transition-colors">
                    ${filteredPersonnel.map(p => `
                        <button onclick="UI.state.selectedPersonId = '${p.id}'; UI.render();" class="w-full text-left px-6 py-5 rounded-2xl flex items-center justify-between transition-all outline-none ${state.selectedPersonId === p.id ? 'bg-indigo-50 dark:bg-indigo-500/15 border-2 border-indigo-500/50 shadow-md transform scale-[1.01]' : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}">
                            <div class="min-w-0 pr-4 flex-1">
                                <div class="font-bold text-lg text-zinc-900 dark:text-white break-words whitespace-normal leading-snug mb-1 transition-colors">${p.name}</div>
                                <div class="text-xs uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors">${getSeniorityName(p.seniority, state)}</div>
                            </div>
                            <i data-lucide="chevron-right" class="w-6 h-6 text-indigo-500 dark:text-indigo-400 shrink-0 opacity-80"></i>
                        </button>
                    `).join('')}
                    ${filteredPersonnel.length === 0 ? `<div class="p-10 text-center text-zinc-500 text-sm font-bold uppercase tracking-widest border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl w-full transition-colors">No matches found</div>` : ''}
                </div>
            </div>
            ` : ''}

            ${showDetail ? `
            <!-- DETAIL VIEW -->
            <div class="flex-1 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl flex flex-col w-full h-full lg:min-h-[600px] overflow-hidden animate-in ${isMobile ? 'slide-in-from-right-4' : 'fade-in'} duration-300 min-w-0 transition-colors">
                ${!selPerson ? `
                    <div class="flex-1 flex flex-col items-center justify-center opacity-50 p-10 text-center h-[500px]">
                        <i data-lucide="user-square-2" class="w-24 h-24 mb-6 text-zinc-400 dark:text-zinc-500"></i>
                        <p class="text-xl font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Select personnel</p>
                    </div>
                ` : `
                    <div class="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-5 shrink-0 bg-zinc-50 dark:bg-zinc-950 w-full min-w-0 transition-colors">
                        <div class="w-full sm:w-auto min-w-0">
                            ${isMobile ? `<button onclick="window.clearSelection()" class="mb-5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-5 py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 w-full border border-indigo-200 dark:border-indigo-500/30 outline-none transition-colors"><i data-lucide="arrow-left" class="w-5 h-5"></i> Back to List</button>` : ''}
                            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white break-words whitespace-normal leading-tight w-full transition-colors">${selPerson.name}</h2>
                            <p class="text-sm text-zinc-500 font-mono font-bold uppercase tracking-widest mt-2">Sys ID: ${selPerson.id.substring(0,8)}...</p>
                        </div>
                        <button onclick="UI.dispatch('deletePerson', {id: '${selPerson.id}'})" class="w-full sm:w-auto bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 border border-red-200 dark:border-red-500/30 shrink-0 outline-none active:scale-95 transition-all shadow-sm">
                            <i data-lucide="trash-2" class="w-5 h-5"></i> Delete User
                        </button>
                    </div>

                    <div class="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 bg-zinc-50 dark:bg-zinc-950/20 hide-scroll w-full min-w-0 transition-colors">
                        
                        <div class="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] border-2 border-zinc-200 dark:border-zinc-700 shadow-md dark:shadow-xl w-full min-w-0 transition-colors">
                            <label class="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-5 uppercase tracking-widest flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 transition-colors"><i data-lucide="award" class="w-6 h-6 text-indigo-500 dark:text-indigo-400"></i> Seniority Level</label>
                            <div class="flex flex-col sm:flex-row gap-5 w-full lg:max-w-md">
                                <select id="editSeniority" class="${inputClass} pr-12 text-indigo-700 dark:text-indigo-300">
                                    ${sortedSen.map(s => `<option value="${s.id}" ${selPerson.seniority === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                                </select>
                                <button onclick="window.handleUpdateSeniority('${selPerson.id}', '${selPerson.name}')" class="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-10 py-4 rounded-2xl font-bold text-base uppercase tracking-widest w-full sm:w-auto border-2 border-zinc-300 dark:border-zinc-600 shadow-sm outline-none active:scale-95 transition-all min-h-[56px]">Update</button>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] border-2 border-zinc-200 dark:border-zinc-700 shadow-md dark:shadow-xl w-full min-w-0 transition-colors">
                            <label class="block text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 transition-colors"><i data-lucide="shield" class="w-6 h-6 text-indigo-500 dark:text-indigo-400"></i> Capabilities</label>
                            <div class="bg-zinc-50 dark:bg-[#18181b] border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 min-h-[160px] flex flex-wrap gap-4 shadow-inner transition-colors">
                                ${state.data.tags.filter(t => t.personId === selPerson.id).map(t => {
                                    const role = state.data.roles.find(r => r.id === t.roleId);
                                    if(!role) return '';
                                    return `
                                    <div class="inline-flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 pl-5 pr-2.5 py-2.5 rounded-2xl text-base font-bold shadow-sm break-words whitespace-normal leading-snug transition-transform hover:scale-[1.02]">
                                        <span class="uppercase tracking-wider">${role.name}</span>
                                        <button onclick="UI.dispatch('deleteTag', {id: '${t.id}'})" class="w-10 h-10 shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors outline-none"><i data-lucide="x" class="w-5 h-5"></i></button>
                                    </div>
                                    `;
                                }).join('') || `<div class="w-full text-center text-zinc-400 dark:text-zinc-500 py-8 flex flex-col items-center justify-center"><i data-lucide="ghost" class="w-12 h-12 mb-4"></i><span class="uppercase font-bold text-sm tracking-widest">No roles assigned.</span></div>`}
                            </div>
                            
                            <div class="mt-8 flex flex-col sm:flex-row gap-5 w-full lg:max-w-2xl">
                                <select id="assignRoleSelect" class="${inputClass} pr-12"><option value="">-- Select Capability --</option>${state.data.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
                                <button onclick="window.handleAssign('${selPerson.id}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-base font-bold w-full sm:w-auto uppercase tracking-widest shadow-lg shrink-0 border border-indigo-500 outline-none active:scale-95 transition-all min-h-[56px]">Grant Access</button>
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