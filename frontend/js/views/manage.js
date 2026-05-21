function ManageView(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);
    const defaultSenId = sortedSen.length > 0 ? sortedSen[0].id : '';

    const searchQ = state.searchQuery.toLowerCase();
    const filteredPersonnel = state.data.personnel.filter(p => p.name.toLowerCase().includes(searchQ));
    const selPerson = state.data.personnel.find(p => p.id === state.selectedPersonId);
    
    return `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col w-full">
        <div class="mb-2 shrink-0">
            <h2 class="text-2xl font-black text-white tracking-wide uppercase">Personnel & Assignments</h2>
            <p class="text-zinc-400 text-sm mt-1">Manage workforce, update seniority levels, and map capabilities.</p>
        </div>

        <!-- Add Personnel Quick Bar -->
        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row gap-5 xl:items-center shadow-xl shrink-0 w-full">
            <div class="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                <input type="text" id="inpNewPerson" class="flex-1 px-4 py-3.5 sm:py-3 text-base font-bold rounded-xl" placeholder="Add single person (e.g. Jane Doe)">
                <select id="inpNewSeniority" class="px-4 py-3.5 sm:py-3 text-sm font-bold w-full sm:w-auto rounded-xl bg-zinc-800">
                    ${sortedSen.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                </select>
                <button onclick="window.handleAddPerson()" class="bg-indigo-600 text-white px-8 py-3.5 sm:py-3 rounded-xl font-black hover:bg-indigo-500 transition-colors text-sm shadow w-full sm:w-auto uppercase tracking-wider">Add</button>
            </div>
            <div class="hidden xl:block w-px h-10 bg-zinc-700"></div>
            <div class="xl:hidden h-px w-full bg-zinc-800"></div>
            <div class="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                <input type="text" id="inpBulkPerson" class="flex-1 px-4 py-3.5 sm:py-3 text-base font-bold rounded-xl" placeholder="Bulk Import (comma separated)">
                <button onclick="window.handleBulkImport('${defaultSenId}')" class="bg-zinc-800 text-zinc-200 px-8 py-3.5 sm:py-3 rounded-xl font-black hover:bg-zinc-700 transition-colors text-sm border border-zinc-600 shadow w-full sm:w-auto uppercase tracking-wider">Import</button>
            </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 flex-1 w-full pb-6 lg:pb-0">
            <!-- Left List: Fuzzy Search -->
            <div class="w-full lg:w-1/3 bg-zinc-900 border border-zinc-700 rounded-2xl flex flex-col shadow-xl shrink-0 h-[45vh] lg:h-auto overflow-hidden">
                <div class="p-4 border-b border-zinc-800 bg-zinc-800/80 shrink-0">
                    <div class="relative">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"></i>
                        <input type="text" id="searchPersonnel" placeholder="Search personnel..." value="${state.searchQuery.replace(/"/g, '&quot;')}" oninput="UI.state.searchQuery = this.value; UI.render();" class="w-full pl-11 pr-4 py-3.5 sm:py-3 text-base font-bold bg-[#18181b] rounded-xl shadow-inner border-none outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto hide-scroll p-3 space-y-2 bg-zinc-950/30">
                    ${filteredPersonnel.map(p => `
                        <button onclick="UI.state.selectedPersonId = '${p.id}'; UI.render();" class="w-full text-left px-5 py-4 rounded-xl flex items-center justify-between group transition-all ${state.selectedPersonId === p.id ? 'bg-indigo-500/20 border-indigo-500/50 shadow-md transform scale-[1.02]' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80'} border outline-none">
                            <div>
                                <div class="font-black text-base ${state.selectedPersonId === p.id ? 'text-indigo-300' : 'text-zinc-200'}">${p.name}</div>
                                <div class="text-[10px] tracking-widest uppercase font-black text-zinc-500 mt-1">${getSeniorityName(p.seniority, state)}</div>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 ${state.selectedPersonId === p.id ? 'text-indigo-400' : 'text-zinc-600 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity'}"></i>
                        </button>
                    `).join('')}
                    ${filteredPersonnel.length === 0 ? `<div class="p-8 text-center text-zinc-500 text-sm font-black uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl m-2">No matches found.</div>` : ''}
                </div>
            </div>

            <!-- Right Detail Panel -->
            <div class="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex flex-col relative overflow-hidden w-full lg:min-h-[500px]">
                ${!selPerson ? `
                    <div class="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none p-6 text-center">
                        <i data-lucide="user-square-2" class="w-20 h-20 sm:w-24 sm:h-24 mb-6 text-zinc-500"></i>
                        <p class="text-lg sm:text-xl text-zinc-400 font-black uppercase tracking-widest">Select personnel to configure</p>
                    </div>
                ` : `
                    <div class="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-sm">
                        <div class="w-full sm:w-auto">
                            <h2 class="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-wide">${selPerson.name}</h2>
                            <p class="text-[10px] sm:text-xs text-zinc-500 font-mono font-bold uppercase tracking-widest">Sys ID: ${selPerson.id.substring(0,8)}...</p>
                        </div>
                        <button onclick="UI.dispatch('deletePerson', {id: '${selPerson.id}'})" class="w-full sm:w-auto bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-5 py-3 sm:py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wide shadow-sm outline-none">
                            <i data-lucide="trash-2" class="w-4 h-4"></i> Remove File
                        </button>
                    </div>

                    <div class="p-5 sm:p-8 flex-1 overflow-y-auto space-y-8 hide-scroll bg-zinc-950/20">
                        
                        <!-- Seniority Update -->
                        <div class="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-700 shadow-xl">
                            <label class="block text-xs font-black text-zinc-400 mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-3"><i data-lucide="award" class="w-5 h-5 text-indigo-400"></i> Seniority Level Classification</label>
                            <div class="flex flex-col sm:flex-row gap-4 w-full lg:max-w-md">
                                <select id="editSeniority" class="flex-1 px-4 py-3.5 sm:py-3 text-base font-black text-indigo-300 bg-[#18181b] rounded-xl shadow-inner w-full border border-zinc-600">
                                    ${sortedSen.map(s => `<option value="${s.id}" ${selPerson.seniority === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                                </select>
                                <button onclick="window.handleUpdateSeniority('${selPerson.id}', '${selPerson.name}')" class="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3.5 sm:py-3 rounded-xl font-black text-sm transition-colors border border-zinc-600 shadow-md w-full sm:w-auto uppercase tracking-wide">Update</button>
                            </div>
                        </div>

                        <!-- Assigned Roles Tags -->
                        <div class="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-700 shadow-xl">
                            <div class="flex justify-between items-end mb-4 border-b border-zinc-800 pb-3">
                                <label class="block text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i data-lucide="shield" class="w-5 h-5 text-indigo-400"></i> Assigned Roster Capabilities</label>
                            </div>
                            <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-4 sm:p-5 min-h-[140px] flex flex-wrap gap-3 items-start content-start shadow-inner">
                                ${state.data.tags.filter(t => t.personId === selPerson.id).map(t => {
                                    const role = state.data.roles.find(r => r.id === t.roleId);
                                    if(!role) return '';
                                    return `
                                    <div class="group inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 pl-4 pr-2 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform hover:scale-105">
                                        <span class="uppercase tracking-wider">${role.name}</span>
                                        <button onclick="UI.dispatch('deleteTag', {id: '${t.id}'})" class="w-8 h-8 rounded-lg bg-indigo-500/20 hover:bg-red-500 border border-transparent hover:border-red-400 flex items-center justify-center text-indigo-300 hover:text-white transition-all outline-none ml-1 shadow-sm">
                                            <i data-lucide="x" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                    `;
                                }).join('') || `<div class="w-full h-full flex flex-col items-center justify-center opacity-40 py-6"><i data-lucide="ghost" class="w-10 h-10 mb-3 text-zinc-500"></i><span class="text-zinc-400 text-xs font-black uppercase tracking-widest text-center">No roles assigned. Cannot be rostered.</span></div>`}
                            </div>
                            
                            <div class="mt-5 flex flex-col sm:flex-row gap-4 w-full lg:max-w-xl">
                                <select id="assignRoleSelect" class="flex-1 px-4 py-3.5 sm:py-3 text-base font-black bg-[#18181b] rounded-xl shadow-inner w-full border border-zinc-600">
                                    <option value="">-- Select Capability to Grant --</option>
                                    ${state.data.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                                </select>
                                <button onclick="window.handleAssign('${selPerson.id}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 sm:py-3 rounded-xl text-sm font-black shadow-lg transition-colors w-full sm:w-auto uppercase tracking-wide">Grant Access</button>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        </div>
    </div>
    `;
}

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