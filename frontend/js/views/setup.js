import { UI, css } from '../store.js';

export function SetupDesktop(state) { return SharedSetupForm(state, false); }
export function SetupMobile(state) { return SharedSetupForm(state, true); }

function SharedSetupForm(state, isMobile) {
    const isEditing = !!state.editingRoleId;
    
    return `
    <div class="space-y-6 w-full animate-in fade-in duration-300">
        <div class="flex flex-col gap-1 mb-2">
            <h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Database Setup</h2>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">Configure roles, concurrency, and shifts.</p>
        </div>

        <div class="${css.card} p-4 md:p-6 w-full">
            <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 class="text-base md:text-lg font-bold ${isEditing ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-white'} flex items-center gap-2 uppercase tracking-wide">
                    <i data-lucide="briefcase" class="w-5 h-5 ${isEditing ? 'text-indigo-500 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}"></i> 
                    ${isEditing ? 'Editing Role' : 'New Role Logic'}
                </h3>
                ${isEditing ? `<button onclick="window.handleCancelEdit()" class="${css.btnSecondary} w-full md:w-auto"><i data-lucide="x-circle" class="w-4 h-4"></i> Cancel Edit</button>` : ''}
            </div>
            
            <div class="space-y-6 w-full">
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div class="w-full">
                        <label class="${css.label}">Role Name</label>
                        <input type="text" id="inpRoleName" class="${css.input}" placeholder="e.g. Area Commander">
                    </div>
                    <div class="w-full">
                        <label class="${css.label}">Role Type</label>
                        <select id="inpRoleType" class="${css.input}">
                            <option value="On-Site">On-Site</option>
                            <option value="Standby">Standby</option>
                        </select>
                    </div>
                    <div class="w-full flex items-end">
                        <label class="flex items-center gap-3 w-full h-[44px] px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:border-indigo-400 transition-colors">
                            <input type="checkbox" id="inpIs247" onchange="window.toggleDays(this.checked)" class="w-5 h-5 rounded text-indigo-600 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-600 focus:ring-indigo-500">
                            <span class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 select-none">Runs 24/7 (Mon-Sun)</span>
                        </label>
                    </div>
                </div>

                <div class="w-full">
                    <label class="${css.label}">Target Days</label>
                    <div class="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 w-full">
                        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `
                            <label class="relative flex-1 sm:flex-none">
                                <input type="checkbox" value="${day}" class="role-day-cb peer sr-only">
                                <div class="px-2 sm:px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm text-center transition-all peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 peer-disabled:opacity-40 cursor-pointer select-none">
                                    ${day}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                ${state.data.roles.length > 0 ? `
                <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 w-full">
                    <label class="block text-xs font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-widest flex items-center gap-2"><i data-lucide="git-merge" class="w-4 h-4 text-indigo-500 dark:text-indigo-400"></i> Concurrency Matrix</label>
                    <div class="flex flex-wrap gap-2 w-full">
                        ${state.data.roles.map(r => `
                            <label class="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 px-3 py-2 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors shadow-sm">
                                <input type="checkbox" value="${r.id}" class="role-concurrent-cb w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500 shrink-0">
                                <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide truncate max-w-[150px]">${r.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4 md:p-6 w-full">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700/50">
                        <div>
                            <label class="block text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide flex items-center gap-2"><i data-lucide="layers" class="w-5 h-5 text-indigo-500 dark:text-indigo-400"></i> Shift Topology</label>
                            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Define shift nodes. (Reserves auto-calculated)</p>
                        </div>
                        <div class="w-full md:w-48 shrink-0">
                            <select id="inpNumShifts" onchange="window.renderShiftInputs()" class="${css.input}">
                                <option value="1">1 Shift Config</option><option value="2">2 Shift Config</option>
                                <option value="3">3 Shift Config</option><option value="4">4 Shift Config</option>
                            </select>
                        </div>
                    </div>
                    <div id="shiftRowsContainer" class="space-y-4 w-full"></div>
                </div>

                <div class="pt-4 flex justify-end w-full">
                    <button onclick="window.handleSaveRole()" class="${css.btnPrimary} w-full md:w-auto px-8">
                        ${isEditing ? '<i data-lucide="save" class="w-4 h-4"></i> Update Role' : '<i data-lucide="plus-circle" class="w-4 h-4"></i> Add Role'}
                    </button>
                </div>
            </div>
        </div>

        ${isMobile ? SetupRolesMobileCards(state) : SetupRolesDesktopTable(state)}
    </div>
    `;
}

function SetupRolesMobileCards(state) {
    return `
    <div class="w-full pt-4">
        <h3 class="font-bold text-zinc-900 dark:text-white text-sm uppercase mb-3 flex items-center gap-2 tracking-wide"><i data-lucide="server" class="w-4 h-4 text-indigo-500 dark:text-indigo-400"></i> Configured Roles <span class="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-2 py-0.5 rounded ml-auto">${state.data.roles.length}</span></h3>
        <div class="flex flex-col gap-3 w-full">
            ${state.data.roles.map(r => `
            <div class="${css.card} p-4 w-full ${state.editingRoleId === r.id ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : ''}">
                <div class="font-bold text-zinc-900 dark:text-white text-base leading-snug break-words mb-3">${r.name}</div>
                <div class="flex flex-col gap-3 mb-4">
                    <span class="w-fit text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest ${r.type === 'Standby' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'}">${r.type}</span>
                    <div class="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <i data-lucide="calendar" class="w-4 h-4 shrink-0 text-indigo-500 dark:text-indigo-400"></i>
                        <span>${r.is247 === true || r.is247 === 'TRUE' ? '<span class="text-indigo-600 dark:text-indigo-400 font-bold">24/7</span>' : r.days}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.handleEditRole('${r.id}')" class="${css.btnSecondary} flex-1 py-2 text-xs"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Edit</button>
                    <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="${css.btnDanger} flex-1 py-2 text-xs"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</button>
                </div>
            </div>
            `).join('')}
            ${state.data.roles.length === 0 ? `<div class="p-6 text-center text-zinc-400 text-sm font-semibold uppercase tracking-widest border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl w-full">No roles setup</div>` : ''}
        </div>
    </div>
    `;
}

function SetupRolesDesktopTable(state) {
    return `
    <div class="${css.card} flex flex-col w-full overflow-hidden mt-6">
        <div class="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <h3 class="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2"><i data-lucide="server" class="w-5 h-5 text-indigo-500 dark:text-indigo-400"></i> Configured Roles</h3>
            <span class="text-xs font-bold bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-1 rounded-lg text-zinc-700 dark:text-zinc-300">${state.data.roles.length} Total</span>
        </div>
        <div class="w-full overflow-x-auto hide-scroll">
            <table class="w-full text-left text-sm text-zinc-600 dark:text-zinc-300 min-w-[700px]">
                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    ${state.data.roles.map(r => `
                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td class="px-5 py-4">
                            <div class="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-3 mb-2">
                                ${r.name} 
                                <span class="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${r.type === 'Standby' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}">${r.type}</span>
                            </div>
                            <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                                <i data-lucide="calendar" class="w-4 h-4"></i> ${r.is247 === true || r.is247 === 'TRUE' ? '<span class="text-indigo-600 dark:text-indigo-400 font-bold">24/7 Continuous</span>' : r.days}
                            </div>
                        </td>
                        <td class="px-5 py-4 text-right w-48">
                            <div class="flex items-center justify-end gap-2">
                                <button onclick="window.handleEditRole('${r.id}')" class="${css.btnSecondary} px-3 py-2"><i data-lucide="edit-2" class="w-4 h-4"></i> Edit</button>
                                <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="${css.btnDanger} px-3 py-2"><i data-lucide="trash-2" class="w-4 h-4"></i> Del</button>
                            </div>
                        </td>
                    </tr>
                    `).join('')}
                    ${state.data.roles.length === 0 ? `<tr><td colspan="2" class="p-8 text-center text-zinc-400 text-sm font-semibold uppercase tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800 m-4 rounded-xl">No roles established</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

// BIND LOGIC
window.toggleDays = (isChecked) => {
    document.querySelectorAll('.role-day-cb').forEach(cb => { cb.checked = isChecked; cb.disabled = isChecked; });
    window.renderShiftInputs();
};

window.renderShiftInputs = () => {
    const num = parseInt(document.getElementById('inpNumShifts').value) || 1;
    const is247 = document.getElementById('inpIs247')?.checked || false;
    const sortedSen = [...UI.state.data.seniorities].sort((a,b) => a.order - b.order);
    
    if(sortedSen.length === 0) {
        document.getElementById('shiftRowsContainer').innerHTML = '<div class="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg font-semibold text-center text-sm border border-red-200 dark:border-red-500/30">Setup Seniority Tiers first.</div>';
        return;
    }

    const hideTimings = (is247 && num === 1);

    let html = '';
    for(let i=1; i<=num; i++) {
        html += `
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl shadow-sm flex flex-col gap-4 w-full">
            <div class="flex flex-col md:flex-row gap-3 w-full">
                <div class="flex-1 w-full">
                    <label class="${css.label}">Shift ID</label>
                    <input type="text" id="sName_${i}" class="${css.input}" value="Shift ${i}">
                </div>
                ${hideTimings ? `
                <div class="flex-1 w-full md:w-auto pt-0 md:pt-[26px]">
                    <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg uppercase flex items-center justify-center h-[44px] border border-indigo-200 dark:border-indigo-500/30">
                        <i data-lucide="clock" class="w-4 h-4 mr-2"></i> 24-Hr Auto
                    </div>
                    <input type="hidden" id="sStart_${i}" value="00:00"><input type="hidden" id="sEnd_${i}" value="00:00">
                </div>
                ` : `
                <div class="flex flex-row gap-2 w-full md:w-auto">
                    <div class="flex-1 md:w-32"><label class="${css.label}">Start</label><input type="time" id="sStart_${i}" step="60" class="${css.input}"></div>
                    <div class="flex-1 md:w-32"><label class="${css.label}">End</label><input type="time" id="sEnd_${i}" step="60" class="${css.input}"></div>
                </div>
                `}
            </div>
            
            <div class="w-full bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <label class="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2"><i data-lucide="user-check" class="w-4 h-4"></i> Headcount Required</label>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                    ${sortedSen.map(sen => `
                    <div class="flex flex-col items-center bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 w-full gap-2 shadow-sm">
                        <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest truncate w-full text-center">${sen.name}</span>
                        <input type="number" id="sReq_${sen.id}_${i}" value="0" min="0" class="w-full max-w-[80px] text-center text-xl font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md py-1 px-1 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none text-zinc-900 dark:text-white">
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