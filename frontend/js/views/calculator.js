import { UI } from '../store.js';

export function CalcDesktop(state) { return SharedCalcForm(state); }
export function CalcMobile(state) { return SharedCalcForm(state); }

function SharedCalcForm(state) {
    const sortedSen = [...state.data.seniorities].sort((a,b) => a.order - b.order);
    const existingCount = {}; sortedSen.forEach(s => existingCount[s.id] = 0);
    state.data.personnel.forEach(p => { if(p.seniority && existingCount[p.seniority] !== undefined) existingCount[p.seniority]++; });

    const DUTY_HOURS_CAPACITY = 15; 
    const EFFECTIVE_SHIFTS_PER_WEEK = 192 / 52.14; 
    let workings = {};
    sortedSen.forEach(s => workings[s.id] = { onSiteHrs: 0, standbyHrs: 0, totalHrs: 0, reserveShifts: 0, reserveHeadcount: 0, requiredCount: 0 });

    state.data.roles.forEach(r => {
        let daysPerWeek = (r.is247 === true || r.is247 === 'TRUE') ? 7 : (r.days.split(',').filter(x=>x).length);
        let roleShifts = state.data.shifts.filter(s => s.roleId === r.id);
        
        roleShifts.forEach(s => {
            let st = new Date(`2000-01-01T${s.start || '00:00'}`); let et = new Date(`2000-01-01T${s.end || '00:00'}`);
            if(et <= st) et.setDate(et.getDate() + 1);
            let hrs = (et - st) / 3600000;
            let shiftReqs = {}; try{ shiftReqs = JSON.parse(s.reqs); }catch(e){}

            sortedSen.forEach(sen => {
                let count = parseInt(shiftReqs[sen.id]) || 0;
                if(count > 0) {
                    if (r.type === 'Standby') {
                        let weeklyStdbyHrs = 12 * count * (daysPerWeek / 7);
                        workings[sen.id].standbyHrs += weeklyStdbyHrs; workings[sen.id].totalHrs += weeklyStdbyHrs;
                    } else {
                        let weeklyOnSiteHrs = hrs * count * daysPerWeek;
                        workings[sen.id].onSiteHrs += weeklyOnSiteHrs; workings[sen.id].totalHrs += weeklyOnSiteHrs;
                        workings[sen.id].reserveShifts += (1 * daysPerWeek);
                    }
                }
            });
        });
    });

    sortedSen.forEach(sen => {
        let baseReq = Math.ceil(workings[sen.id].totalHrs / DUTY_HOURS_CAPACITY);
        let resReq = Math.ceil(workings[sen.id].reserveShifts / EFFECTIVE_SHIFTS_PER_WEEK);
        workings[sen.id].reserveHeadcount = resReq;
        workings[sen.id].requiredCount = baseReq + resReq;
    });

    return `
    <div class="space-y-6 w-full">
        <div class="flex flex-col lg:flex-row justify-between lg:items-end mb-4 gap-4 w-full">
            <div><h2 class="text-2xl font-black text-white uppercase">Manpower Calculator</h2></div>
            <div class="bg-[#18181b] border border-zinc-700 rounded-xl p-1.5 w-full lg:w-auto">
                <select onchange="UI.state.viewMode = this.value; UI.render();" class="w-full px-5 py-3 text-sm font-black uppercase tracking-wider text-center-last border-none outline-none">
                    <option value="both" ${state.viewMode === 'both' ? 'selected' : ''}>Complete Overview</option>
                    <option value="req" ${state.viewMode === 'req' ? 'selected' : ''}>Required Min. Only</option>
                    <option value="act" ${state.viewMode === 'act' ? 'selected' : ''}>Current Headcount Only</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            ${sortedSen.map(sen => {
                const w = workings[sen.id]; const req = w.requiredCount; const act = existingCount[sen.id]; const diff = act - req; const isDeficit = diff < 0;
                
                return `
                <div class="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex flex-col w-full">
                    <div class="p-6 border-b border-zinc-700/50 bg-zinc-800/80">
                        <h3 class="text-zinc-200 text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><i data-lucide="user-check" class="w-5 h-5 text-indigo-400"></i> ${sen.name} Tier</h3>
                        <div class="flex justify-between items-end">
                            <div class="${state.viewMode === 'req' ? 'hidden' : ''}"><div class="text-5xl font-black text-white">${act}</div><div class="text-[10px] uppercase font-bold text-zinc-500 mt-2">Current</div></div>
                            <div class="text-right ${state.viewMode === 'act' ? 'hidden' : ''} ${state.viewMode === 'req' ? 'w-full text-left' : ''}"><div class="text-4xl font-black text-indigo-300">${req}</div><div class="text-[10px] uppercase font-bold text-zinc-500 mt-2">Required</div></div>
                        </div>
                        <div class="pt-5 mt-5 border-t border-zinc-700/50 ${state.viewMode === 'both' ? '' : 'hidden'}">
                            ${isDeficit 
                                ? `<div class="text-red-400 font-bold text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 uppercase flex justify-center"><i data-lucide="trending-down" class="w-5 h-5 mr-2"></i> Deficit of ${Math.abs(diff)}</div>`
                                : `<div class="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 uppercase flex justify-center"><i data-lucide="trending-up" class="w-5 h-5 mr-2"></i> Surplus of ${diff}</div>`
                            }
                        </div>
                    </div>
                    
                    <div class="p-6 bg-zinc-950/80 flex-1 border-t border-zinc-800 ${state.viewMode === 'both' ? '' : 'hidden'}">
                        <div class="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-5 flex items-center gap-1.5"><i data-lucide="function-square" class="w-4 h-4"></i> Workings</div>
                        <div class="space-y-4 text-xs font-mono text-zinc-300">
                            <div class="flex justify-between border-b border-zinc-800 pb-3 items-center">
                                <div class="flex items-center"><span>On-Site Demand:</span><button onclick="window.openModal('onSite')" class="ml-2 bg-zinc-800 rounded p-1"><i data-lucide="help-circle" class="w-4 h-4 text-zinc-500"></i></button></div>
                                <span class="font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">${w.onSiteHrs.toFixed(1)} hrs/wk</span>
                            </div>
                            <div class="flex justify-between border-b border-zinc-800 pb-3 items-center text-orange-200">
                                <div class="flex items-center"><span>Standby Buffers:</span><button onclick="window.openModal('standby')" class="ml-2 bg-zinc-800 rounded p-1"><i data-lucide="help-circle" class="w-4 h-4 text-orange-500/50"></i></button></div>
                                <span class="font-bold bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">+ ${w.standbyHrs.toFixed(1)} hrs</span>
                            </div>
                            <div class="flex justify-between border-b border-zinc-800 pb-3 items-center text-indigo-300">
                                <div class="flex items-center"><span>Base Headcount:</span><button onclick="window.openModal('baseReq')" class="ml-2 bg-zinc-800 rounded p-1"><i data-lucide="help-circle" class="w-4 h-4 text-indigo-500/50"></i></button></div>
                                <span class="font-bold bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">${w.totalHrs.toFixed(1)} ÷ 15 = ${Math.ceil(w.totalHrs / 15)}</span>
                            </div>
                            <div class="flex justify-between pb-3 items-center text-amber-300">
                                <div class="flex items-center"><span>Reserves:</span><button onclick="window.openModal('reserve')" class="ml-2 bg-zinc-800 rounded p-1"><i data-lucide="help-circle" class="w-4 h-4 text-amber-500/50"></i></button></div>
                                <span class="font-bold text-sm bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">+ ${w.reserveHeadcount}</span>
                            </div>
                            <div class="flex justify-between mt-5 bg-indigo-500/20 p-5 rounded-xl border border-indigo-500/40 text-white items-center">
                                <div class="flex items-center"><span class="uppercase font-black text-xs">Total:</span></div>
                                <span class="font-black text-3xl drop-shadow-md bg-zinc-950 px-4 py-1.5 rounded-lg">${req}</span>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>
    `;
}