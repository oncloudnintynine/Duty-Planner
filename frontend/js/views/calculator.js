import { UI, css } from '../store.js';

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
    <div class="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
        <div class="flex flex-col lg:flex-row justify-between lg:items-end mb-4 gap-4 w-full">
            <div class="flex flex-col gap-1">
                <h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Calculator</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">Mathematical framework mapping topology to hiring needs.</p>
            </div>
            <div class="w-full lg:w-48 shrink-0">
                <select onchange="UI.state.viewMode = this.value; UI.render();" class="${css.input} text-sm">
                    <option value="both" ${state.viewMode === 'both' ? 'selected' : ''}>Overview</option>
                    <option value="req" ${state.viewMode === 'req' ? 'selected' : ''}>Required Only</option>
                    <option value="act" ${state.viewMode === 'act' ? 'selected' : ''}>Current Only</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0">
            ${sortedSen.map(sen => {
                const w = workings[sen.id]; const req = w.requiredCount; const act = existingCount[sen.id]; const diff = act - req; const isDeficit = diff < 0;
                
                return `
                <div class="${css.card} flex flex-col w-full min-w-0 overflow-hidden">
                    <div class="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <h3 class="text-zinc-900 dark:text-white text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2"><i data-lucide="user-check" class="w-4 h-4 text-indigo-500"></i> ${sen.name}</h3>
                        <div class="flex justify-between items-end gap-2 w-full">
                            <div class="${state.viewMode === 'req' ? 'hidden' : ''}">
                                <div class="text-3xl font-black text-zinc-900 dark:text-white">${act}</div>
                                <div class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Current</div>
                            </div>
                            <div class="text-right ${state.viewMode === 'act' ? 'hidden' : ''} ${state.viewMode === 'req' ? 'w-full text-left' : ''}">
                                <div class="text-3xl font-black text-indigo-600 dark:text-indigo-400">${req}</div>
                                <div class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Required</div>
                            </div>
                        </div>
                        <div class="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 ${state.viewMode === 'both' ? '' : 'hidden'}">
                            ${isDeficit 
                                ? `<div class="text-red-600 dark:text-red-400 font-bold text-[11px] bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg uppercase tracking-wider flex justify-center items-center"><i data-lucide="trending-down" class="w-3.5 h-3.5 mr-2"></i> Deficit of ${Math.abs(diff)}</div>`
                                : `<div class="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg uppercase tracking-wider flex justify-center items-center"><i data-lucide="trending-up" class="w-3.5 h-3.5 mr-2"></i> Surplus of ${diff}</div>`
                            }
                        </div>
                    </div>
                    
                    <div class="p-4 md:p-5 bg-white dark:bg-zinc-900 flex-1 ${state.viewMode === 'both' ? '' : 'hidden'} min-w-0">
                        <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-3 flex items-center gap-1.5"><i data-lucide="function-square" class="w-3 h-3"></i> Workings</div>
                        <div class="space-y-3 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                            
                            <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                <div class="flex items-center gap-1"><span>On-Site:</span><button onclick="window.openModal('onSite')" class="p-1 outline-none"><i data-lucide="help-circle" class="w-3.5 h-3.5 text-zinc-400"></i></button></div>
                                <span class="font-semibold">${w.onSiteHrs.toFixed(1)} <span class="text-[10px]">hrs</span></span>
                            </div>
                            
                            <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 text-orange-600 dark:text-orange-300">
                                <div class="flex items-center gap-1"><span>Standby:</span><button onclick="window.openModal('standby')" class="p-1 outline-none"><i data-lucide="help-circle" class="w-3.5 h-3.5 text-orange-400"></i></button></div>
                                <span class="font-semibold">+ ${w.standbyHrs.toFixed(1)} <span class="text-[10px]">hrs</span></span>
                            </div>
                            
                            <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 text-indigo-600 dark:text-indigo-300">
                                <div class="flex items-center gap-1"><span>Base:</span><button onclick="window.openModal('baseReq')" class="p-1 outline-none"><i data-lucide="help-circle" class="w-3.5 h-3.5 text-indigo-400"></i></button></div>
                                <div class="font-semibold flex items-center gap-1"><span>${w.totalHrs.toFixed(1)}÷15 =</span><span>${Math.ceil(w.totalHrs / 15)}</span></div>
                            </div>
                            
                            <div class="flex justify-between items-center pb-1 text-amber-600 dark:text-amber-400">
                                <div class="flex items-center gap-1"><span>Reserve:</span><button onclick="window.openModal('reserve')" class="p-1 outline-none"><i data-lucide="help-circle" class="w-3.5 h-3.5 text-amber-500"></i></button></div>
                                <span class="font-semibold">+ ${w.reserveHeadcount}</span>
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