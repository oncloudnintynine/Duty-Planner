import { UI } from '../store.js';

export function SetupDesktop(state) {
    return SharedSetupForm(state, false);
}

export function SetupMobile(state) {
    return SharedSetupForm(state, true);
}

function SharedSetupForm(state, isMobile) {
    const isEditing = !!state.editingRoleId;
    
    // Core structure identical, but CSS purely adapted to viewport guarantees no overflow
    return `
    <div class="space-y-6 w-full">
        <div class="mb-2">
            <h2 class="text-2xl font-black text-white tracking-wide uppercase">Database Setup</h2>
        </div>

        <div class="bg-zinc-900 border ${isEditing ? 'border-indigo-500' : 'border-zinc-700'} rounded-2xl p-5 shadow-xl w-full">
            <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
                <h3 class="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                    <i data-lucide="briefcase" class="w-6 h-6 text-indigo-400"></i> ${isEditing ? 'Editing Role' : 'New Role Logic'}
                </h3>
                ${isEditing ? `<button onclick="window.handleCancelEdit()" class="text-sm font-bold text-zinc-300 px-5 py-3 bg-zinc-800 rounded-xl w-full lg:w-auto uppercase">Cancel Edit</button>` : ''}
            </div>
            
            <div class="space-y-6 w-full">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
                    <div class="w-full">
                        <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase">Role Name</label>
                        <input type="text" id="inpRoleName" class="w-full" placeholder="e.g. Commander">
                    </div>
                    <div class="w-full">
                        <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase">Role Type</label>
                        <select id="inpRoleType" class="w-full">
                            <option value="On-Site">On-Site</option>
                            <option value="Standby">Standby</option>
                        </select>
                    </div>
                    <div class="w-full">
                        <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase">Pattern</label>
                        <label class="flex items-center gap-3 bg-[#18181b] border-2 border-zinc-600 rounded-xl px-4 py-3 cursor-pointer">
                            <input type="checkbox" id="inpIs247" onchange="window.toggleDays(this.checked)" class="w-6 h-6 shrink-0 rounded text-indigo-500">
                            <span class="text-sm font-bold text-white">Runs 24/7 (Mon-Sun)</span>
                        </label>
                    </div>
                </div>

                <div class="pt-2 w-full">
                    <label class="block text-xs font-bold text-zinc-400 mb-3 uppercase">Target Days</label>
                    <div class="grid grid-cols-3 lg:grid-cols-7 gap-3 w-full">
                        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `
                            <label class="flex items-center justify-center gap-2 bg-[#18181b] border-2 border-zinc-600 p-3 rounded-xl cursor-pointer">
                                <input type="checkbox" value="${day}" class="role-day-cb w-5 h-5 rounded text-indigo-500 shrink-0">
                                <span class="text-sm font-bold text-white">${day}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                ${state.data.roles.length > 0 ? `
                <div class="p-5 bg-zinc-800/50 border border-zinc-600 rounded-2xl mt-6 w-full">
                    <label class="block text-xs font-bold text-zinc-300 mb-4 uppercase"><i data-lucide="git-merge" class="w-5 h-5 text-indigo-400 inline"></i> Concurrency Matrix</label>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">
                        ${state.data.roles.map(r => `
                            <label class="flex items-center gap-3 bg-[#18181b] border-2 border-zinc-600 px-4 py-3 rounded-xl cursor-pointer w-full">
                                <input type="checkbox" value="${r.id}" class="role-concurrent-cb w-5 h-5 rounded text-indigo-500 shrink-0">
                                <span class="text-xs font-bold text-white uppercase truncate">${r.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mt-6 w-full">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5 pb-5 border-b border-zinc-800">
                        <label class="block text-base font-black text-white uppercase"><i data-lucide="layers" class="w-6 h-6 text-indigo-400 inline"></i> Topology</label>
                        <select id="inpNumShifts" onchange="window.renderShiftInputs()" class="w-full lg:w-48 bg-zinc-800">
                            <option value="1">1 Shift Config</option><option value="2">2 Shift Config</option>
                            <option value="3">3 Shift Config</option><option value="4">4 Shift Config</option>
                        </select>
                    </div>
                    <div id="shiftRowsContainer" class="space-y-5 w-full"></div>
                </div>

                <button onclick="window.handleSaveRole()" class="w-full lg:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase shadow-xl mt-4">${isEditing ? 'Update Role' : 'Add Role'}</button>
            </div>
        </div>

        <!-- Render correct table/card format based on layout -->
        ${isMobile ? SetupRolesMobileCards(state) : SetupRolesDesktopTable(state)}
    </div>
    `;
}

function SetupRolesMobileCards(state) {
    return `
    <div class="w-full pt-4">
        <h3 class="font-black text-white text-sm uppercase mb-4"><i data-lucide="server" class="w-5 h-5 text-indigo-400 inline"></i> Roles (${state.data.roles.length})</h3>
        <div class="grid grid-cols-1 gap-4 w-full">
            ${state.data.roles.map(r => `
            <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-full">
                <div class="font-bold text-white text-base mb-2">${r.name}</div>
                <div class="text-xs text-zinc-400 font-bold mb-4 bg-[#18181b] p-3 rounded-lg border border-zinc-800 truncate">
                    ${r.is247 === true || r.is247 === 'TRUE' ? '24/7 Continuous' : r.days}
                </div>
                <div class="flex gap-3">
                    <button onclick="window.handleEditRole('${r.id}')" class="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-xl font-bold uppercase text-xs">Edit</button>
                    <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="flex-1 bg-zinc-800 text-red-400 py-3 rounded-xl font-bold uppercase text-xs">Delete</button>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
    `;
}

function SetupRolesDesktopTable(state) {
    return `
    <div class="bg-zinc-900 border border-zinc-700 rounded-2xl flex flex-col w-full">
        <div class="p-5 border-b border-zinc-800 bg-zinc-800/50"><h3 class="font-black text-white text-sm uppercase">Configured Roles</h3></div>
        <div class="w-full overflow-x-auto">
            <table class="w-full text-left text-sm text-zinc-300 min-w-[650px]">
                <tbody class="divide-y divide-zinc-800/80">
                    ${state.data.roles.map(r => `
                    <tr class="hover:bg-zinc-800/40">
                        <td class="p-5">
                            <div class="font-bold text-white text-base">${r.name} <span class="text-[10px] ml-2 px-2 py-0.5 rounded-md uppercase bg-emerald-500/10 text-emerald-400">${r.type}</span></div>
                            <div class="text-xs text-zinc-400 mt-2">${r.is247 === true || r.is247 === 'TRUE' ? '24/7 Continuous' : r.days}</div>
                        </td>
                        <td class="p-5 text-right">
                            <button onclick="window.handleEditRole('${r.id}')" class="text-indigo-400 px-3 py-2 bg-zinc-800 rounded-lg mr-2">Edit</button>
                            <button onclick="UI.dispatch('deleteRole', {id: '${r.id}'})" class="text-red-400 px-3 py-2 bg-zinc-800 rounded-lg">Del</button>
                        </td>
                    </tr>
                    `).join('')}
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
        document.getElementById('shiftRowsContainer').innerHTML = '<div class="p-5 text-red-400 bg-red-500/10 rounded-xl font-bold text-center">Setup Seniority Tiers first.</div>';
        return;
    }

    const hideTimings = (is247 && num === 1);
    const isMobile = UI.state.isMobile;

    let html = '';
    for(let i=1; i<=num; i++) {
        html += `
        <div class="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700 shadow-md flex flex-col gap-5 w-full">
            <div class="flex flex-col lg:flex-row gap-4 w-full">
                <div class="flex-1 w-full">
                    <label class="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">Shift ID</label>
                    <input type="text" id="sName_${i}" class="w-full bg-[#18181b]" value="Shift ${i}">
                </div>
                ${hideTimings ? `
                <div class="flex-1 w-full lg:w-auto pt-5">
                    <div class="text-xs font-black text-indigo-400 bg-indigo-500/10 rounded-xl uppercase flex items-center justify-center h-[48px]">24-Hour Continuous</div>
                    <input type="hidden" id="sStart_${i}" value="00:00"><input type="hidden" id="sEnd_${i}" value="00:00">
                </div>
                ` : `
                <div class="flex flex-row gap-3 w-full lg:w-auto">
                    <div class="flex-1 lg:w-36"><label class="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">Start</label><input type="time" id="sStart_${i}" step="60" class="w-full bg-[#18181b]"></div>
                    <div class="flex-1 lg:w-36"><label class="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">End</label><input type="time" id="sEnd_${i}" step="60" class="w-full bg-[#18181b]"></div>
                </div>
                `}
            </div>
            
            <div class="w-full bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                <label class="block text-xs font-black text-emerald-400 mb-4 uppercase">Headcount Needed</label>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    ${sortedSen.map(sen => `
                    <div class="flex flex-col items-center justify-center bg-zinc-900 p-3 rounded-xl border border-zinc-800 w-full gap-2">
                        <span class="text-xs text-zinc-400 font-bold uppercase truncate w-full text-center">${sen.name}</span>
                        <input type="number" id="sReq_${sen.id}_${i}" value="0" min="0" class="w-full max-w-[80px] text-center text-xl">
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