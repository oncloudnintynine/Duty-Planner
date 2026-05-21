import { UI } from '../store.js';

export function SetupView(state) {
    const isEditing = !!state.editingRoleId;
    
    return `
    <div class="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
        <div class="mb-2 shrink-0">
            <h2 class="text-2xl font-black text-white tracking-wide uppercase">Database Setup</h2>
            <p class="text-zinc-400 text-sm mt-1">Configure your roles, concurrency matrix, and shift headcount requirements.</p>
        </div>

        <div class="bg-zinc-900 border ${isEditing ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-zinc-700'} rounded-2xl p-4 sm:p-6 shadow-xl w-full min-w-0">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
                <h3 class="text-lg font-black ${isEditing ? 'text-indigo-400' : 'text-white'} flex items-center gap-2 uppercase tracking-wide">
                    <i data-lucide="briefcase" class="w-6 h-6 ${isEditing ? 'text-indigo-400' : 'text-zinc-500'}"></i> 
                    ${isEditing ? 'Editing Role Configuration' : 'New Role Logic'}
                </h3>
                ${isEditing ? `<button onclick="window.handleCancelEdit()" class="text-sm font-bold text-zinc-300 hover:text-white px-5 py-3 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 rounded-xl shadow-sm w-full sm:w-auto uppercase tracking-wide flex items-center justify-center gap-2 outline-none"><i data-lucide="x-circle" class="w-4 h-4"></i> Cancel Edit</button>` : ''}
            </div>
            
            <div class="space-y-6">
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full min-w-0">
                    <div class="w-full">
                        <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Role Name</label>
                        <input type="text" id="inpRoleName" class="w-full px-4 py-3 sm:py-2.5 text-base font-bold rounded-xl" placeholder="e.g. Area Commander">
                    </div>
                    <div class="w-full">
                        <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Role Type</label>
                        <select id="inpRoleType" class="w-full px-4 py-3 sm:py-2.5 text-base font-bold rounded-xl bg-zinc-900">
                            <option value="On-Site">On-Site (Requires Presence)</option>
                            <option value="Standby">Standby (Recall Only)</option>
                        </select>
                    </div>
                    <div class="w-full">
                        <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Weekly Pattern</label>
                        <label class="flex items-center gap-3 bg-[#18181b] border-2 border-zinc-600 rounded-xl px-4 py-3 sm:py-2.5 cursor-pointer hover:border-indigo-400 transition-colors sm:h-[46px] shadow-inner">
                            <input type="checkbox" id="inpIs247" onchange="window.toggleDays(this.checked)" class="w-6 h-6 sm:w-5 sm:h-5 rounded text-indigo-500 focus:ring-indigo-500 shrink-0">
                            <span class="text-sm font-bold text-white">Runs 24/7 (Mon-Sun)</span>
                        </label>
                    </div>
                </div>

                <div class="pt-2 w-full min-w-0">
                    <label class="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest">Target Days (if not 24/7)</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap gap-3 w-full">
                        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `
                            <label class="flex items-center justify-center sm:justify-start gap-2 bg-[#18181b] border-2 border-zinc-600 p-3 sm:px-5 sm:py-2.5 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors shadow-inner flex-1 md:flex-none">
                                <input type="checkbox" value="${day}" class="role-day-cb w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500 shrink-0">
                                <span class="text-sm font-bold text-white">${day}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                ${state.data.roles.length > 0 ? `
                <div class="p-4 sm:p-5 bg-zinc-800/50 border border-zinc-600 rounded-2xl shadow-inner mt-6 w-full min-w-0">
                    <label class="block text-xs font-bold text-zinc-300 mb-2 uppercase tracking-widest flex items-center gap-2"><i data-lucide="git-merge" class="w-5 h-5 text-indigo-400"></i> Concurrency Matrix</label>
                    <p class="text-xs text-zinc-400 mb-4 leading-relaxed">Select other roles that this person can execute at the exact same time without violating rest rules.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                        ${state.data.roles.map(r => `
                            <label class="flex items-center gap-3 bg-[#18181b] border-2 border-zinc-600 px-4 py-3 sm:py-2.5 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors shadow-sm w-full">
                                <input type="checkbox" value="${r.id}" class="role-concurrent-cb w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500 shrink-0">
                                <span class="text-xs font-bold text-white uppercase tracking-wider truncate">${r.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-6 mt-6 shadow-xl w-full min-w-0">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5 pb-5 border-b border-zinc-800">
                        <div>
                            <label class="block text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2"><i data-lucide="layers" class="w-6 h-6 text-indigo-400"></i> Shift Topology & Headcount</label>
                            <p class="text-[11px] sm:text-xs text-zinc-400 mt-2 leading-relaxed">Define shift times and exact personnel required per seniority. (1 Reserve per active seniority auto-generated)</p>
                        </div>
                        <div class="w-full lg:w-48 shrink-0">
                            <select id="inpNumShifts" onchange="window.renderShiftInputs()" class="w-full px-4 py-3 sm:py-2.5 text-sm font-black shadow-md bg-zinc-800 text-center rounded-xl border border-zinc-600 outline-none">
                                <option value="1">1 Shift Configuration</option>
                                <option value="2">2 Shift Configuration</option>
                                <option value="3">3 Shift Configuration</option>
                                <option value="4">4 Shift Configuration</option>
                            </select>
                        </div>
                    </div>
                    <!-- This Container MUST be hydrated by renderShiftInputs() -->
                    <div id="shiftRowsContainer" class="space-y-5 w-full min-w-0">
                    </div>
                </div>

                <div class="pt-6 flex justify-end w-full">
                    <button onclick="window.handleSaveRole()" class="${isEditing ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-200'} w-full md:w-auto px-8 py-4 sm:py-3 rounded-xl font-black transition-all text-sm shadow-xl flex items-center justify-center gap-2 uppercase tracking-wide border ${isEditing ? 'border-indigo-400' : 'border-zinc-300'} outline-none">
                        ${isEditing ? '<i data-lucide="save" class="w-5 h-5"></i> Update Role' : '<i data-lucide="plus-circle" class="w-5 h-5"></i> Add Role to Database'}
                    </button>
                </div>
            </div>
        </div>

        <!-- Roles Table view -->
        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl flex flex-col shadow-xl overflow-hidden w-full min-w-0">
            <div class="p-5 border-b border-zinc-800 bg-zinc-800/50 flex justify-between items-center shrink-0">
                <h3 class="font-black text-white text-sm tracking-widest uppercase flex items-center gap-2"><i data-lucide="server" class="w-5 h-5 text-indigo-400"></i> Configured Roles</h3>
                <span class="text-xs font-black bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-lg text-indigo-300 shadow-sm shrink-0">${state.data.roles.length} Roles</span>
            </div>
            <div class="w-full overflow-x-auto hide-scroll min-w-0">
                <table class="w-full text-left text-sm text-zinc-300 min-w-[650px]">
                    <tbody class="divide-y divide-zinc-800/80">
                        ${state.data.roles.map(r => `
                        <tr class="hover:bg-zinc-800/40 group transition-colors ${state.editingRoleId === r.id ? 'bg-indigo-500/10' : ''}">
                            <td class="p-4 sm:p-5">
                                <div class="font-bold text-white flex flex-wrap items-center gap-2 text-base">
                                    ${r.name} 
                                    <span class="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${r.type === 'Standby' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}">${r.type}</span>
                                </div>
                                <div class="text-xs text-zinc-400 font-bold mt-2 flex items-center gap-2">
                                    <i data-lucide="calendar" class="w-4 h-4"></i>
                                    ${r.is247 === true || r.is247 === 'TRUE' ? '<span class="text-indigo-300 font-black">24/7 Continuous (Mon-Sun)</span>' : r.days}
                                </div>
                            </td>
                            <td class="p-4 sm:p-5 text-right w-32">
                                <div class="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button onclick="window.handleEditRole('${r.id}')" class="text-zinc-400 hover:text-indigo-400 p-2.5 sm:p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-600 transition-colors flex items-center justify-center shadow-sm outline-none">
                                        <i data-lucide="edit-2" class="w-5 h-5 sm:w-4 sm:h-4"></i>
                                    </button>
                                    <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="text-zinc-400 hover:text-red-400 p-2.5 sm:p-2 bg-zinc-800 hover:bg-red-500/20 rounded-xl border border-zinc-600 hover:border-red-500/40 transition-colors shadow-sm outline-none">
                                        <i data-lucide="trash-2" class="w-5 h-5 sm:w-4 sm:h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        `).join('') || `<tr><td colspan="2" class="p-8 text-center text-zinc-500 text-sm font-bold uppercase tracking-widest border border-dashed border-zinc-700 m-4 rounded-xl">No roles established in the system</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

// BIND LOGIC GLOBALLY FOR HTML ONCLICK CALLS
window.toggleDays = (isChecked) => {
    document.querySelectorAll('.role-day-cb').forEach(cb => {
        cb.checked = isChecked;
        cb.disabled = isChecked;
    });
    window.renderShiftInputs();
};

window.renderShiftInputs = () => {
    const num = parseInt(document.getElementById('inpNumShifts').value) || 1;
    const is247 = document.getElementById('inpIs247')?.checked || false;
    const sortedSen = [...UI.state.data.seniorities].sort((a,b) => a.order - b.order);
    
    if(sortedSen.length === 0) {
        const container = document.getElementById('shiftRowsContainer');
        if(container) container.innerHTML = '<div class="p-5 text-red-400 border border-red-500/50 bg-red-500/10 rounded-xl font-bold text-center">Error: You must setup Seniority Tiers in Advanced Settings first.</div>';
        return;
    }

    const hideTimings = (is247 && num === 1);

    let html = '';
    for(let i=1; i<=num; i++) {
        html += `
        <div class="bg-zinc-800/40 p-4 sm:p-5 rounded-2xl border border-zinc-700 shadow-md flex flex-col gap-4 sm:gap-5 w-full min-w-0">
            <div class="flex flex-col lg:flex-row gap-4 lg:items-end w-full">
                <div class="flex-1 w-full min-w-0">
                    <label class="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Shift Node Identifier</label>
                    <input type="text" id="sName_${i}" class="w-full px-4 py-3 sm:py-2.5 text-base font-bold bg-[#18181b] rounded-xl" value="Shift ${i}">
                </div>
                ${hideTimings ? `
                <div class="flex-1 w-full lg:w-auto">
                    <div class="text-[10px] sm:text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-4 py-3 sm:py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 w-full h-[46px] shadow-inner">
                       <i data-lucide="clock" class="w-5 h-5 shrink-0"></i> 24-Hour Continuous Auto-Applied
                    </div>
                    <input type="hidden" id="sStart_${i}" value="00:00">
                    <input type="hidden" id="sEnd_${i}" value="00:00">
                </div>
                ` : `
                <div class="flex gap-4 w-full lg:w-auto">
                    <div class="flex-1 lg:w-32 min-w-0">
                        <label class="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Start (24H)</label>
                        <input type="time" id="sStart_${i}" step="60" class="w-full px-3 py-3 sm:py-2.5 text-base font-mono bg-[#18181b] rounded-xl">
                    </div>
                    <div class="flex-1 lg:w-32 min-w-0">
                        <label class="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">End (24H)</label>
                        <input type="time" id="sEnd_${i}" step="60" class="w-full px-3 py-3 sm:py-2.5 text-base font-mono bg-[#18181b] rounded-xl">
                    </div>
                </div>
                `}
            </div>
            
            <div class="w-full min-w-0">
                <div class="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-800 shadow-inner w-full">
                    <label class="block text-xs font-black text-emerald-400 mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-3"><i data-lucide="user-check" class="w-5 h-5"></i> Active Headcount Needed</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                        ${sortedSen.map(sen => `
                        <div class="flex items-center justify-between group bg-zinc-900 p-3 rounded-lg border border-zinc-800 shadow-sm w-full">
                            <span class="text-sm text-zinc-300 font-bold truncate pr-2">${sen.name}</span>
                            <input type="number" id="sReq_${sen.id}_${i}" value="0" min="0" class="w-20 bg-[#18181b] text-white font-black text-lg outline-none text-center rounded-lg border border-zinc-600 px-2 py-1.5 shrink-0 shadow-inner">
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    const container = document.getElementById('shiftRowsContainer');
    if(container) {
        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }
};

window.handleEditRole = (id) => {
    const role = UI.state.data.roles.find(r => r.id === id);
    if(!role) return;
    const shifts = UI.state.data.shifts.filter(s => s.roleId === id);
    
    UI.state.editingRoleId = id;
    UI.render(); 
    
    setTimeout(() => {
        document.getElementById('inpRoleName').value = role.name;
        document.getElementById('inpRoleType').value = role.type;
        
        const is247 = (role.is247 === true || role.is247 === 'TRUE');
        document.getElementById('inpIs247').checked = is247;
        
        document.querySelectorAll('.role-day-cb').forEach(cb => {
            cb.checked = role.days.includes(cb.value);
            cb.disabled = is247;
        });
        
        let cRoles = [];
        try { cRoles = JSON.parse(role.concurrentRoles); } catch(e){}
        document.querySelectorAll('.role-concurrent-cb').forEach(cb => {
            cb.checked = cRoles.includes(cb.value);
        });
        
        document.getElementById('inpNumShifts').value = shifts.length;
        window.renderShiftInputs();
        
        setTimeout(() => {
            shifts.forEach((s, i) => {
                const idx = i + 1;
                document.getElementById(`sName_${idx}`).value = s.name;
                
                const stInput = document.getElementById(`sStart_${idx}`);
                const enInput = document.getElementById(`sEnd_${idx}`);
                if(stInput && stInput.type !== 'hidden') stInput.value = (s.start || "").substring(0,5);
                if(enInput && enInput.type !== 'hidden') enInput.value = (s.end || "").substring(0,5);
                
                let reqs = {};
                try { reqs = JSON.parse(s.reqs); } catch(e){}
                UI.state.data.seniorities.forEach(sen => {
                    const reqEl = document.getElementById(`sReq_${sen.id}_${idx}`);
                    if(reqEl) reqEl.value = reqs[sen.id] || 0;
                });
            });
        }, 50); 
    }, 50); 
};

window.handleCancelEdit = () => {
    UI.state.editingRoleId = null;
    UI.render();
    setTimeout(() => { window.renderShiftInputs(); }, 50);
};

window.handleSaveRole = () => {
    const roleName = document.getElementById('inpRoleName').value.trim();
    const roleType = document.getElementById('inpRoleType').value;
    const is247 = document.getElementById('inpIs247').checked;
    
    const days = [];
    if (is247) {
        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => days.push(d));
    } else {
        document.querySelectorAll('.role-day-cb:checked').forEach(cb => days.push(cb.value));
    }

    const concurrentRoles = [];
    document.querySelectorAll('.role-concurrent-cb:checked').forEach(cb => concurrentRoles.push(cb.value));
    
    const sortedSen = [...UI.state.data.seniorities].sort((a,b) => a.order - b.order);
    const num = parseInt(document.getElementById('inpNumShifts').value) || 1;
    const shifts = [];
    
    for(let i=1; i<=num; i++) {
        const sn = document.getElementById(`sName_${i}`).value.trim();
        const st = document.getElementById(`sStart_${i}`).value;
        const se = document.getElementById(`sEnd_${i}`).value;
        
        const shiftReqs = {};
        sortedSen.forEach(sen => {
            const reqEl = document.getElementById(`sReq_${sen.id}_${i}`);
            if(reqEl) { shiftReqs[sen.id] = parseInt(reqEl.value) || 0; }
        });

        if(!sn || !st || !se) return UI.showToast("Missing parameters in shift inputs.", "error");
        
        shifts.push({ 
            name: sn, 
            start: st, 
            end: se,
            reqs: shiftReqs
        });
    }

    if(!roleName) return UI.showToast("Role name is required.", "error");
    if(days.length === 0) return UI.showToast("Select at least one day constraint.", "error");

    const payload = { roleName, roleType, is247, daysOfWeek: days, concurrentRoles, shifts };

    if(UI.state.editingRoleId) {
        UI.dispatch('updateRole', { id: UI.state.editingRoleId, ...payload });
    } else {
        UI.dispatch('addRole', payload);
    }
};