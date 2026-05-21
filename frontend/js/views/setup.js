import { UI } from '../store.js';

export function SetupDesktop(state) {
    return SharedSetupForm(state, false);
}

export function SetupMobile(state) {
    return SharedSetupForm(state, true);
}

function SharedSetupForm(state, isMobile) {
    const isEditing = !!state.editingRoleId;
    
    return `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
        <div class="mb-4 shrink-0">
            <h2 class="text-3xl font-black text-white tracking-wide uppercase">Database Setup</h2>
            <p class="text-zinc-400 text-sm md:text-base mt-2">Configure your roles, concurrency matrix, and shift headcount requirements.</p>
        </div>

        <div class="bg-zinc-900 border ${isEditing ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-zinc-700'} rounded-3xl p-5 md:p-8 shadow-2xl w-full min-w-0">
            <div class="flex flex-col md:flex-row justify-between md:items-center gap-5 mb-8 pb-5 border-b border-zinc-800">
                <h3 class="text-xl md:text-2xl font-black ${isEditing ? 'text-indigo-400' : 'text-white'} flex items-center gap-3 uppercase tracking-wide">
                    <i data-lucide="briefcase" class="w-8 h-8 ${isEditing ? 'text-indigo-400' : 'text-zinc-500'}"></i> 
                    ${isEditing ? 'Editing Role Config' : 'New Role Logic'}
                </h3>
                ${isEditing ? `<button onclick="window.handleCancelEdit()" class="text-base font-black text-zinc-300 hover:text-white px-6 py-4 bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 rounded-xl shadow-sm w-full md:w-auto uppercase flex items-center justify-center gap-3 outline-none"><i data-lucide="x-circle" class="w-5 h-5"></i> Cancel Edit</button>` : ''}
            </div>
            
            <div class="space-y-8 w-full">
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0">
                    <div class="w-full">
                        <label class="block text-sm font-bold text-zinc-400 mb-2.5 uppercase tracking-widest">Role Name</label>
                        <input type="text" id="inpRoleName" class="w-full text-lg font-black" placeholder="e.g. Area Commander">
                    </div>
                    <div class="w-full">
                        <label class="block text-sm font-bold text-zinc-400 mb-2.5 uppercase tracking-widest">Role Type</label>
                        <select id="inpRoleType" class="w-full text-lg font-black bg-zinc-900">
                            <option value="On-Site">On-Site (Requires Presence)</option>
                            <option value="Standby">Standby (Recall Only)</option>
                        </select>
                    </div>
                    <div class="w-full">
                        <label class="block text-sm font-bold text-zinc-400 mb-2.5 uppercase tracking-widest">Weekly Pattern</label>
                        <label class="relative flex w-full">
                            <input type="checkbox" id="inpIs247" onchange="window.toggleDays(this.checked)" class="peer sr-only">
                            <div class="w-full flex items-center justify-center gap-4 rounded-xl px-5 py-4 bg-zinc-900 border-2 border-zinc-600 text-zinc-400 font-black transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-checked:text-white cursor-pointer select-none min-h-[52px]">
                                <i data-lucide="clock-4" class="w-6 h-6"></i> Runs 24/7 (Mon-Sun)
                            </div>
                        </label>
                    </div>
                </div>

                <div class="pt-2 w-full min-w-0">
                    <label class="block text-sm font-bold text-zinc-400 mb-3.5 uppercase tracking-widest">Target Days (if not 24/7)</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap gap-4 w-full">
                        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `
                            <label class="relative flex-1 md:flex-none">
                                <input type="checkbox" value="${day}" class="role-day-cb peer sr-only">
                                <div class="px-5 py-4 rounded-xl bg-zinc-900 border-2 border-zinc-700 text-zinc-400 font-black text-base md:text-sm text-center transition-all peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 peer-checked:text-indigo-300 peer-disabled:opacity-40 peer-disabled:cursor-not-allowed hover:border-zinc-500 cursor-pointer select-none min-h-[52px] flex items-center justify-center">
                                    ${day}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                ${state.data.roles.length > 0 ? `
                <div class="p-5 md:p-6 bg-zinc-800/50 border border-zinc-600 rounded-2xl shadow-inner mt-8 w-full min-w-0">
                    <label class="block text-sm font-bold text-zinc-300 mb-3 uppercase tracking-widest flex items-center gap-3"><i data-lucide="git-merge" class="w-6 h-6 text-indigo-400"></i> Concurrency Matrix</label>
                    <p class="text-sm text-zinc-400 mb-6 leading-relaxed">Select other roles that this person can execute at the exact same time without violating rest rules.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        ${state.data.roles.map(r => `
                            <label class="flex items-start gap-4 bg-[#18181b] border-2 border-zinc-600 px-5 py-4 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors shadow-sm w-full min-h-[52px]">
                                <input type="checkbox" value="${r.id}" class="role-concurrent-cb mt-0.5 rounded text-indigo-500 focus:ring-indigo-500 shrink-0">
                                <span class="text-sm font-bold text-white uppercase tracking-wider leading-snug break-words whitespace-normal w-full">${r.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 md:p-8 mt-8 shadow-xl w-full min-w-0">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-zinc-800">
                        <div>
                            <label class="block text-xl font-black text-white uppercase tracking-wide flex items-center gap-3"><i data-lucide="layers" class="w-7 h-7 text-indigo-400"></i> Shift Topology</label>
                            <p class="text-sm text-zinc-400 mt-2 leading-relaxed">Define shift times and exact personnel required per seniority. (1 Reserve per active seniority auto-generated)</p>
                        </div>
                        <div class="w-full md:w-56 shrink-0">
                            <select id="inpNumShifts" onchange="window.renderShiftInputs()" class="w-full text-base font-black shadow-md bg-zinc-800 text-center rounded-xl border border-zinc-600 outline-none">
                                <option value="1">1 Shift Config</option>
                                <option value="2">2 Shift Config</option>
                                <option value="3">3 Shift Config</option>
                                <option value="4">4 Shift Config</option>
                            </select>
                        </div>
                    </div>
                    <div id="shiftRowsContainer" class="space-y-6 w-full min-w-0">
                    </div>
                </div>

                <div class="pt-8 flex justify-end w-full">
                    <button onclick="window.handleSaveRole()" class="${isEditing ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-200'} w-full md:w-auto px-10 py-5 rounded-2xl font-black transition-all text-base shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest border ${isEditing ? 'border-indigo-400' : 'border-zinc-300'} outline-none">
                        ${isEditing ? '<i data-lucide="save" class="w-6 h-6"></i> Update Role' : '<i data-lucide="plus-circle" class="w-6 h-6"></i> Add Role'}</button>
                </div>
            </div>
        </div>

        ${isMobile ? SetupRolesMobileCards(state) : SetupRolesDesktopTable(state)}
    </div>
    `;
}

function SetupRolesMobileCards(state) {
    return `
    <div class="w-full pt-6">
        <h3 class="font-black text-white text-base uppercase mb-5 flex items-center gap-3 tracking-widest"><i data-lucide="server" class="w-6 h-6 text-indigo-400"></i> Roles (${state.data.roles.length})</h3>
        <div class="grid grid-cols-1 gap-5 w-full">
            ${state.data.roles.map(r => `
            <div class="bg-zinc-900 border ${state.editingRoleId === r.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700'} rounded-3xl p-6 w-full shadow-lg">
                <div class="font-black text-white text-xl leading-snug break-words whitespace-normal mb-3">${r.name}</div>
                <div class="flex flex-col gap-3 mb-5">
                    <span class="w-fit text-xs px-3 py-1.5 rounded-lg font-black uppercase tracking-widest ${r.type === 'Standby' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}">${r.type}</span>
                    <div class="text-sm text-zinc-400 font-bold flex items-center gap-3 bg-[#18181b] p-3.5 rounded-xl border border-zinc-800 break-words whitespace-normal leading-snug">
                        <i data-lucide="calendar" class="w-5 h-5 shrink-0 text-indigo-400"></i>
                        <span>${r.is247 === true || r.is247 === 'TRUE' ? '<span class="text-indigo-300 font-black">24/7 Continuous</span>' : r.days}</span>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button onclick="window.handleEditRole('${r.id}')" class="flex-1 bg-zinc-800 text-zinc-300 py-4 rounded-xl font-black uppercase text-sm border border-zinc-700 shadow-sm flex justify-center items-center gap-2"><i data-lucide="edit-2" class="w-4 h-4"></i> Edit</button>
                    <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="flex-1 bg-red-500/10 text-red-400 py-4 rounded-xl font-black uppercase text-sm border border-red-500/20 shadow-sm flex justify-center items-center gap-2"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
    `;
}

function SetupRolesDesktopTable(state) {
    return `
    <div class="bg-zinc-900 border border-zinc-700 rounded-3xl flex flex-col w-full shadow-xl mt-8">
        <div class="p-6 border-b border-zinc-800 bg-zinc-800/50 flex items-center justify-between">
            <h3 class="font-black text-white text-base uppercase tracking-widest flex items-center gap-3"><i data-lucide="server" class="w-6 h-6 text-indigo-400"></i> Configured Roles</h3>
            <span class="text-sm font-black bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-lg text-indigo-300">${state.data.roles.length} Total</span>
        </div>
        <div class="w-full overflow-x-auto hide-scroll">
            <table class="w-full text-left text-sm text-zinc-300 min-w-[700px]">
                <tbody class="divide-y divide-zinc-800/80">
                    ${state.data.roles.map(r => `
                    <tr class="hover:bg-zinc-800/40 transition-colors">
                        <td class="p-6">
                            <div class="font-black text-white text-lg flex items-center gap-3">
                                ${r.name} 
                                <span class="text-xs px-2.5 py-1 rounded-md uppercase tracking-wider ${r.type === 'Standby' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}">${r.type}</span>
                            </div>
                            <div class="text-sm text-zinc-400 mt-3 font-bold flex items-center gap-2">
                                <i data-lucide="calendar" class="w-4 h-4"></i> ${r.is247 === true || r.is247 === 'TRUE' ? '24/7 Continuous' : r.days}
                            </div>
                        </td>
                        <td class="p-6 text-right w-48">
                            <div class="flex items-center justify-end gap-3">
                                <button onclick="window.handleEditRole('${r.id}')" class="text-zinc-300 hover:text-indigo-400 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-600 transition-colors flex items-center justify-center shadow-sm">
                                    <i data-lucide="edit-2" class="w-5 h-5"></i>
                                </button>
                                <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="text-zinc-300 hover:text-red-400 p-3 bg-zinc-800 hover:bg-red-500/20 rounded-xl border border-zinc-600 hover:border-red-500/40 transition-colors flex items-center justify-center shadow-sm">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    `).join('')}
                    ${state.data.roles.length === 0 ? `<tr><td colspan="2" class="p-10 text-center text-zinc-500 text-base font-black uppercase tracking-widest border border-dashed border-zinc-700 m-6 rounded-2xl">No roles established in the system</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

// BIND LOGIC TO WINDOW FOR INLINE HTML CALLS
window.toggleDays = (isChecked) => {
    document.querySelectorAll('.role-day-cb').forEach(cb => { cb.checked = isChecked; cb.disabled = isChecked; });
    window.renderShiftInputs();
};

window.renderShiftInputs = () => {
    const num = parseInt(document.getElementById('inpNumShifts').value) || 1;
    const is247 = document.getElementById('inpIs247')?.checked || false;
    const sortedSen = [...UI.state.data.seniorities].sort((a,b) => a.order - b.order);
    
    if(sortedSen.length === 0) {
        document.getElementById('shiftRowsContainer').innerHTML = '<div class="p-6 text-red-400 bg-red-500/10 rounded-2xl font-black text-center text-base border border-red-500/30">Setup Seniority Tiers in Advanced Settings first.</div>';
        return;
    }

    const hideTimings = (is247 && num === 1);

    let html = '';
    for(let i=1; i<=num; i++) {
        html += `
        <div class="bg-zinc-800/40 p-5 md:p-6 rounded-3xl border border-zinc-700 shadow-md flex flex-col gap-6 w-full">
            <div class="flex flex-col md:flex-row gap-5 w-full">
                <div class="flex-1 w-full">
                    <label class="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Shift ID</label>
                    <input type="text" id="sName_${i}" class="w-full bg-[#18181b] text-lg" value="Shift ${i}">
                </div>
                ${hideTimings ? `
                <div class="flex-1 w-full md:w-auto pt-0 md:pt-7">
                    <div class="text-sm font-black text-indigo-400 bg-indigo-500/10 rounded-xl uppercase tracking-widest flex items-center justify-center h-[52px] border border-indigo-500/30">
                        <i data-lucide="clock" class="w-5 h-5 mr-2 shrink-0"></i> 24-Hr Continuous
                    </div>
                    <input type="hidden" id="sStart_${i}" value="00:00"><input type="hidden" id="sEnd_${i}" value="00:00">
                </div>
                ` : `
                <div class="flex flex-row gap-4 w-full md:w-auto">
                    <div class="flex-1 md:w-40"><label class="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Start</label><input type="time" id="sStart_${i}" step="60" class="w-full bg-[#18181b] text-lg font-mono"></div>
                    <div class="flex-1 md:w-40"><label class="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">End</label><input type="time" id="sEnd_${i}" step="60" class="w-full bg-[#18181b] text-lg font-mono"></div>
                </div>
                `}
            </div>
            
            <div class="w-full bg-zinc-950 p-5 md:p-6 rounded-2xl border border-zinc-800">
                <label class="block text-sm font-black text-emerald-400 mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-4"><i data-lucide="user-check" class="w-5 h-5"></i> Headcount Needed</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
                    ${sortedSen.map(sen => `
                    <div class="flex flex-col items-center justify-center bg-zinc-900 p-4 rounded-xl border border-zinc-800 w-full gap-3">
                        <span class="text-sm text-zinc-400 font-black uppercase tracking-widest break-words whitespace-normal text-center w-full">${sen.name}</span>
                        <input type="number" id="sReq_${sen.id}_${i}" value="0" min="0" class="w-full max-w-[100px] text-center text-2xl font-black bg-[#18181b] border-zinc-600">
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;
    }
    const container = document.getElementById('shiftRowsContainer');
    if(container) { container.innerHTML = html; if (window.lucide) window.lucide.createIcons(); }
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
        
        document.querySelectorAll('.role-day-cb').forEach(cb => { cb.checked = role.days.includes(cb.value); cb.disabled = is247; });
        let cRoles = []; try { cRoles = JSON.parse(role.concurrentRoles); } catch(e){}
        document.querySelectorAll('.role-concurrent-cb').forEach(cb => { cb.checked = cRoles.includes(cb.value); });
        
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
                
                let reqs = {}; try { reqs = JSON.parse(s.reqs); } catch(e){}
                UI.state.data.seniorities.forEach(sen => {
                    const reqEl = document.getElementById(`sReq_${sen.id}_${idx}`);
                    if(reqEl) reqEl.value = reqs[sen.id] || 0;
                });
            });
        }, 50); 
    }, 50); 
};

window.handleCancelEdit = () => { UI.state.editingRoleId = null; UI.render(); setTimeout(window.renderShiftInputs, 50); };

window.handleSaveRole = () => {
    const roleName = document.getElementById('inpRoleName').value.trim();
    const roleType = document.getElementById('inpRoleType').value;
    const is247 = document.getElementById('inpIs247').checked;
    const days = [];
    if (is247) { ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => days.push(d)); } else { document.querySelectorAll('.role-day-cb:checked').forEach(cb => days.push(cb.value)); }
    const concurrentRoles = []; document.querySelectorAll('.role-concurrent-cb:checked').forEach(cb => concurrentRoles.push(cb.value));
    
    const sortedSen = [...UI.state.data.seniorities].sort((a,b) => a.order - b.order);
    const num = parseInt(document.getElementById('inpNumShifts').value) || 1;
    const shifts = [];
    for(let i=1; i<=num; i++) {
        const sn = document.getElementById(`sName_${i}`).value.trim();
        const st = document.getElementById(`sStart_${i}`).value;
        const se = document.getElementById(`sEnd_${i}`).value;
        const shiftReqs = {};
        sortedSen.forEach(sen => { const reqEl = document.getElementById(`sReq_${sen.id}_${i}`); if(reqEl) shiftReqs[sen.id] = parseInt(reqEl.value) || 0; });
        if(!sn || !st || !se) return UI.showToast("Missing parameters in shift inputs.", "error");
        shifts.push({ name: sn, start: st, end: se, reqs: shiftReqs });
    }

    if(!roleName) return UI.showToast("Role name is required.", "error");
    if(days.length === 0) return UI.showToast("Select at least one day constraint.", "error");

    const payload = { roleName, roleType, is247, daysOfWeek: days, concurrentRoles, shifts };
    if(UI.state.editingRoleId) UI.dispatch('updateRole', { id: UI.state.editingRoleId, ...payload });
    else UI.dispatch('addRole', payload);
};