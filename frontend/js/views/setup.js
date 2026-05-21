import { UI } from '../store.js';

export function SetupDesktop(state) { return SharedSetupForm(state, false); }
export function SetupMobile(state) { return SharedSetupForm(state, true); }

function SharedSetupForm(state, isMobile) {
    const isEditing = !!state.editingRoleId;
    
    return `
    <div class="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex flex-col gap-1">
            <h2 class="text-3xl font-bold text-white uppercase tracking-wide">Database Setup</h2>
            <p class="text-zinc-400 text-base">Configure your roles, concurrency matrix, and shift headcount requirements.</p>
        </div>

        <div class="bg-zinc-900 border ${isEditing ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-zinc-800'} rounded-[2rem] p-5 sm:p-8 w-full shadow-2xl">
            <div class="flex flex-col md:flex-row justify-between md:items-center gap-5 mb-8 pb-6 border-b border-zinc-800/80">
                <h3 class="text-xl md:text-2xl font-bold ${isEditing ? 'text-indigo-400' : 'text-white'} flex items-center gap-3 uppercase tracking-wide">
                    <i data-lucide="briefcase" class="w-7 h-7 ${isEditing ? 'text-indigo-400' : 'text-zinc-500'}"></i> 
                    ${isEditing ? 'Editing Role' : 'New Role Logic'}
                </h3>
                ${isEditing ? `<button onclick="window.handleCancelEdit()" class="text-base font-bold text-white px-6 py-4 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-2xl w-full md:w-auto uppercase flex items-center justify-center gap-3 outline-none shadow-md border border-zinc-700"><i data-lucide="x-circle" class="w-5 h-5"></i> Cancel Edit</button>` : ''}
            </div>
            
            <div class="space-y-8 w-full">
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                    <div class="w-full flex flex-col gap-2">
                        <label class="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">Role Name</label>
                        <input type="text" id="inpRoleName" class="w-full text-lg font-medium bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g. Area Commander">
                    </div>
                    <div class="w-full flex flex-col gap-2">
                        <label class="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">Role Type</label>
                        <select id="inpRoleType" class="w-full text-lg font-medium bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none pr-12">
                            <option value="On-Site">On-Site (Presence)</option>
                            <option value="Standby">Standby (Recall)</option>
                        </select>
                    </div>
                    <div class="w-full flex flex-col gap-2">
                        <label class="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">Pattern</label>
                        <label class="relative flex w-full h-[62px]">
                            <input type="checkbox" id="inpIs247" onchange="window.toggleDays(this.checked)" class="peer sr-only">
                            <div class="w-full h-full flex items-center justify-center gap-4 rounded-2xl px-5 bg-zinc-950 border border-zinc-700 text-zinc-400 font-bold transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-checked:text-white cursor-pointer select-none">
                                <i data-lucide="clock-4" class="w-6 h-6"></i> 24/7 (Mon-Sun)
                            </div>
                        </label>
                    </div>
                </div>

                <div class="w-full pt-2">
                    <label class="block text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-widest px-1">Target Days</label>
                    <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 w-full">
                        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `
                            <label class="relative w-full h-[60px]">
                                <input type="checkbox" value="${day}" class="role-day-cb peer sr-only">
                                <div class="w-full h-full rounded-2xl bg-zinc-950 border border-zinc-700 text-zinc-400 font-bold text-base text-center transition-all peer-checked:bg-indigo-500/20 peer-checked:border-indigo-500 peer-checked:text-indigo-300 peer-disabled:opacity-30 flex items-center justify-center cursor-pointer select-none">
                                    ${day}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                ${state.data.roles.length > 0 ? `
                <div class="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-5 sm:p-7 shadow-inner mt-8 w-full">
                    <label class="block text-sm font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3"><i data-lucide="git-merge" class="w-6 h-6 text-indigo-400"></i> Concurrency Matrix</label>
                    <p class="text-base text-zinc-500 mb-6">Select roles this person can execute concurrently.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        ${state.data.roles.map(r => `
                            <label class="flex items-start gap-4 bg-zinc-900 border border-zinc-700 p-4 rounded-2xl cursor-pointer hover:border-indigo-500 transition-colors shadow-sm w-full min-h-[60px]">
                                <input type="checkbox" value="${r.id}" class="role-concurrent-cb mt-1 w-6 h-6 rounded-md bg-zinc-800 border-zinc-600 text-indigo-500 focus:ring-indigo-500 shrink-0 outline-none">
                                <span class="text-base font-bold text-zinc-200 uppercase tracking-wide leading-snug break-words whitespace-normal w-full pt-1">${r.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="bg-zinc-800/30 border border-zinc-700/50 rounded-[2rem] p-5 sm:p-8 mt-8 shadow-inner w-full">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-700/50">
                        <div>
                            <label class="block text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3"><i data-lucide="layers" class="w-7 h-7 text-indigo-400"></i> Shift Topology</label>
                            <p class="text-base text-zinc-500 mt-2 leading-relaxed">Define shift nodes and headcount required. <br/><span class="text-indigo-400 font-medium">(Reserves automatically calculated by engine)</span></p>
                        </div>
                        <div class="w-full lg:w-56 shrink-0">
                            <select id="inpNumShifts" onchange="window.renderShiftInputs()" class="w-full text-lg font-bold shadow-md bg-zinc-900 px-5 py-4 rounded-2xl border border-zinc-700 outline-none focus:border-indigo-500">
                                <option value="1">1 Shift Config</option>
                                <option value="2">2 Shift Config</option>
                                <option value="3">3 Shift Config</option>
                                <option value="4">4 Shift Config</option>
                            </select>
                        </div>
                    </div>
                    <div id="shiftRowsContainer" class="space-y-6 w-full"></div>
                </div>

                <div class="pt-8 flex justify-end w-full">
                    <button onclick="window.handleSaveRole()" class="${isEditing ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-900'} w-full md:w-auto px-10 py-5 rounded-2xl font-bold transition-transform active:scale-95 text-lg shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest outline-none">
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
    <div class="w-full pt-8 pb-4">
        <h3 class="font-bold text-white text-xl uppercase mb-6 flex items-center gap-3 tracking-wide"><i data-lucide="server" class="w-6 h-6 text-indigo-400"></i> Configured Roles <span class="bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1 rounded-lg ml-auto">${state.data.roles.length}</span></h3>
        <div class="flex flex-col gap-5 w-full">
            ${state.data.roles.map(r => `
            <div class="bg-zinc-900 border ${state.editingRoleId === r.id ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-zinc-800'} rounded-[2rem] p-6 w-full shadow-lg">
                <div class="font-bold text-white text-xl leading-snug break-words whitespace-normal mb-4">${r.name}</div>
                <div class="flex flex-col gap-4 mb-6">
                    <span class="w-fit text-xs px-4 py-2 rounded-xl font-bold uppercase tracking-widest ${r.type === 'Standby' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">${r.type}</span>
                    <div class="text-base text-zinc-300 font-medium flex items-center gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <i data-lucide="calendar" class="w-5 h-5 shrink-0 text-indigo-400"></i>
                        <span>${r.is247 === true || r.is247 === 'TRUE' ? '<span class="text-indigo-300 font-bold">24/7 Continuous</span>' : r.days}</span>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button onclick="window.handleEditRole('${r.id}')" class="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm border border-zinc-700 flex justify-center items-center gap-2 outline-none active:scale-95 transition-transform"><i data-lucide="edit-2" class="w-4 h-4"></i> Edit</button>
                    <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="flex-1 bg-red-500/10 text-red-400 py-4 rounded-xl font-bold uppercase tracking-wider text-sm border border-red-500/20 flex justify-center items-center gap-2 outline-none active:scale-95 transition-transform"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>
                </div>
            </div>
            `).join('')}
            ${state.data.roles.length === 0 ? `<div class="p-10 text-center text-zinc-500 text-base font-bold uppercase tracking-widest border border-dashed border-zinc-800 rounded-3xl w-full">No roles setup</div>` : ''}
        </div>
    </div>
    `;
}

function SetupRolesDesktopTable(state) {
    return `
    <div class="bg-zinc-900 border border-zinc-800 rounded-[2rem] flex flex-col w-full shadow-2xl mt-12 overflow-hidden">
        <div class="p-6 md:p-8 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <h3 class="font-bold text-white text-xl uppercase tracking-wide flex items-center gap-3"><i data-lucide="server" class="w-6 h-6 text-indigo-400"></i> Configured Roles</h3>
            <span class="text-base font-bold bg-indigo-500/20 border border-indigo-500/30 px-4 py-1.5 rounded-xl text-indigo-300">${state.data.roles.length} Total</span>
        </div>
        <div class="w-full overflow-x-auto hide-scroll">
            <table class="w-full text-left text-base text-zinc-300 min-w-[800px]">
                <tbody class="divide-y divide-zinc-800/80">
                    ${state.data.roles.map(r => `
                    <tr class="hover:bg-zinc-800/40 transition-colors">
                        <td class="p-6 md:p-8">
                            <div class="font-bold text-white text-xl flex items-center gap-4 mb-3">
                                ${r.name} 
                                <span class="text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold ${r.type === 'Standby' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">${r.type}</span>
                            </div>
                            <div class="text-base text-zinc-400 font-medium flex items-center gap-3">
                                <i data-lucide="calendar" class="w-5 h-5"></i> ${r.is247 === true || r.is247 === 'TRUE' ? '<span class="text-indigo-300 font-bold">24/7 Continuous</span>' : r.days}
                            </div>
                        </td>
                        <td class="p-6 md:p-8 text-right w-64">
                            <div class="flex items-center justify-end gap-3">
                                <button onclick="window.handleEditRole('${r.id}')" class="text-white px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-600 transition-colors flex items-center justify-center font-bold text-sm uppercase shadow-sm outline-none">
                                    <i data-lucide="edit-2" class="w-4 h-4 mr-2"></i> Edit
                                </button>
                                <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="text-red-400 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-colors flex items-center justify-center font-bold text-sm uppercase shadow-sm outline-none">
                                    <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Del
                                </button>
                            </div>
                        </td>
                    </tr>
                    `).join('')}
                    ${state.data.roles.length === 0 ? `<tr><td colspan="2" class="p-16 text-center text-zinc-500 text-lg font-bold uppercase tracking-widest border border-dashed border-zinc-800 m-8 rounded-3xl">No roles established</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

// Global Binds
window.toggleDays = (isChecked) => {
    document.querySelectorAll('.role-day-cb').forEach(cb => { cb.checked = isChecked; cb.disabled = isChecked; });
    window.renderShiftInputs();
};

window.renderShiftInputs = () => {
    const num = parseInt(document.getElementById('inpNumShifts').value) || 1;
    const is247 = document.getElementById('inpIs247')?.checked || false;
    const sortedSen = [...UI.state.data.seniorities].sort((a,b) => a.order - b.order);
    
    if(sortedSen.length === 0) {
        document.getElementById('shiftRowsContainer').innerHTML = '<div class="p-8 text-red-400 bg-red-500/10 rounded-2xl font-bold text-center text-lg border border-red-500/30">Setup Seniority Tiers in Advanced Settings first.</div>';
        return;
    }

    const hideTimings = (is247 && num === 1);

    let html = '';
    for(let i=1; i<=num; i++) {
        html += `
        <div class="bg-zinc-950 p-5 sm:p-6 rounded-3xl border border-zinc-800 shadow-inner flex flex-col gap-6 w-full">
            <div class="flex flex-col lg:flex-row gap-5 w-full">
                <div class="flex-1 w-full flex flex-col gap-2">
                    <label class="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">Shift ID</label>
                    <input type="text" id="sName_${i}" class="w-full text-lg font-bold bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none" value="Shift ${i}">
                </div>
                ${hideTimings ? `
                <div class="flex-1 w-full lg:w-auto pt-0 lg:pt-[30px]">
                    <div class="text-base font-bold text-indigo-400 bg-indigo-500/10 rounded-2xl uppercase tracking-widest flex items-center justify-center min-h-[62px] border border-indigo-500/30">
                        <i data-lucide="clock" class="w-6 h-6 mr-3 shrink-0"></i> 24-Hr Continuous
                    </div>
                    <input type="hidden" id="sStart_${i}" value="00:00"><input type="hidden" id="sEnd_${i}" value="00:00">
                </div>
                ` : `
                <div class="flex flex-row gap-4 w-full lg:w-auto">
                    <div class="flex-1 lg:w-44 flex flex-col gap-2"><label class="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">Start</label><input type="time" id="sStart_${i}" step="60" class="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-4 text-lg font-mono text-white outline-none focus:border-indigo-500"></div>
                    <div class="flex-1 lg:w-44 flex flex-col gap-2"><label class="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">End</label><input type="time" id="sEnd_${i}" step="60" class="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-4 text-lg font-mono text-white outline-none focus:border-indigo-500"></div>
                </div>
                `}
            </div>
            
            <div class="w-full bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-700 mt-2">
                <label class="block text-sm font-bold text-emerald-400 mb-5 uppercase tracking-widest flex items-center gap-3 border-b border-zinc-800 pb-4"><i data-lucide="user-check" class="w-6 h-6"></i> Headcount Needed</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    ${sortedSen.map(sen => `
                    <div class="flex flex-col items-center justify-center bg-zinc-950 p-4 rounded-2xl border border-zinc-800 w-full gap-3">
                        <span class="text-sm text-zinc-400 font-bold uppercase tracking-widest break-words whitespace-normal text-center w-full leading-snug">${sen.name}</span>
                        <input type="number" id="sReq_${sen.id}_${i}" value="0" min="0" class="w-full max-w-[100px] text-center text-3xl font-black bg-[#18181b] border border-zinc-700 rounded-xl py-2 px-1 focus:border-indigo-500 outline-none text-white">
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