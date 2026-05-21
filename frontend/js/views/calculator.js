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

    const inputClass = "w-full text-base sm:text-lg font-bold bg-white dark:bg-[#18181b] border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white outline-none transition-colors shadow-sm dark:shadow-none min-h-[56px] focus:border-indigo-500 dark:focus:border-indigo-500";

    return `
    <div class="space-y-8 w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex flex-col lg:flex-row justify-between lg:items-end mb-6 gap-6 w-full">
            <div class="flex flex-col gap-2">
                <h2 class="text-3xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide transition-colors">Calculator</h2>
                <p class="text-base text-zinc-500 dark:text-zinc-400 transition-colors">Mathematical framework mapping topology to hiring needs.</p>
            </div>
            <div class="w-full lg:w-auto shrink-0">
                <select onchange="UI.state.viewMode = this.value; UI.render();" class="${inputClass} pr-12 text-center-last uppercase tracking-wider text-sm">
                    <option value="both" ${state.viewMode === 'both' ? 'selected' : ''}>Complete Overview</option>
                    <option value="req" ${state.viewMode === 'req' ? 'selected' : ''}>Required Min. Only</option>
                    <option value="act" ${state.viewMode === 'act' ? 'selected' : ''}>Current Headcount Only</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 w-full min-w-0">
            ${sortedSen.map(sen => {
                const w = workings[sen.id]; const req = w.requiredCount; const act = existingCount[sen.id]; const diff = act - req; const isDeficit = diff < 0;
                
                return `
                <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-xl dark:shadow-2xl flex flex-col w-full min-w-0 transition-transform hover:-translate-y-1 duration-300">
                    <div class="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-950/50 rounded-t-[2rem] transition-colors">
                        <h3 class="text-zinc-800 dark:text-zinc-200 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3 transition-colors"><i data-lucide="user-check" class="w-6 h-6 text-indigo-500 dark:text-indigo-400"></i> ${sen.name} Tier</h3>
                        <div class="flex justify-between items-end gap-4 w-full">
                            <div class="${state.viewMode === 'req' ? 'hidden' : ''}">
                                <div class="text-6xl font-black text-zinc-900 dark:text-white transition-colors">${act}</div>
                                <div class="text-xs uppercase font-bold tracking-widest text-zinc-500 mt-2 transition-colors">Current</div>
                            </div>
                            <div class="text-right ${state.viewMode === 'act' ? 'hidden' : ''} ${state.viewMode === 'req' ? 'w-full text-left' : ''}">
                                <div class="text-5xl font-black text-indigo-600 dark:text-indigo-300 transition-colors">${req}</div>
                                <div class="text-xs uppercase font-bold tracking-widest text-zinc-500 mt-2 transition-colors">Required</div>
                            </div>
                        </div>
                        <div class="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-700/50 ${state.viewMode === 'both' ? '' : 'hidden'} transition-colors">
                            ${isDeficit 
                                ? `<div class="text-red-600 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-500/10 px-5 py-4 rounded-xl border border-red-200 dark:border-red-500/20 uppercase tracking-wider flex justify-center items-center shadow-sm dark:shadow-inner transition-colors"><i data-lucide="trending-down" class="w-5 h-5 mr-3 shrink-0"></i> Deficit of ${Math.abs(diff)}</div>`
                                : `<div class="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-5 py-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider flex justify-center items-center shadow-sm dark:shadow-inner transition-colors"><i data-lucide="trending-up" class="w-5 h-5 mr-3 shrink-0"></i> Surplus of ${diff}</div>`
                            }
                        </div>
                    </div>
                    
                    <div class="p-6 md:p-8 bg-white dark:bg-zinc-900 flex-1 rounded-b-[2rem] ${state.viewMode === 'both' ? '' : 'hidden'} min-w-0 transition-colors">
                        <div class="text-xs uppercase font-bold text-zinc-500 tracking-widest mb-6 flex items-center gap-2 transition-colors"><i data-lucide="function-square" class="w-4 h-4"></i> Workings</div>
                        <div class="space-y-5 text-sm md:text-base font-mono text-zinc-600 dark:text-zinc-300 transition-colors">
                            
                            <div class="flex flex-wrap justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-3 w-full transition-colors">
                                <div class="flex items-center gap-3"><span>On-Site Demand:</span><button onclick="window.openModal('onSite')" class="bg-zinc-100 dark:bg-[#18181b] rounded-lg p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 outline-none"><i data-lucide="help-circle" class="w-4 h-4 text-zinc-500 dark:text-zinc-400"></i></button></div>
                                <span class="font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-inner transition-colors">${w.onSiteHrs.toFixed(1)} <span class="text-xs">hrs</span></span>
                            </div>
                            
                            <div class="flex flex-wrap justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 text-orange-600 dark:text-orange-200 gap-3 w-full transition-colors">
                                <div class="flex items-center gap-3"><span>Standby Buffers:</span><button onclick="window.openModal('standby')" class="bg-zinc-100 dark:bg-[#18181b] rounded-lg p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 outline-none"><i data-lucide="help-circle" class="w-4 h-4 text-orange-500"></i></button></div>
                                <span class="font-bold bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-500/20 shadow-sm dark:shadow-inner transition-colors">+ ${w.standbyHrs.toFixed(1)} <span class="text-xs">hrs</span></span>
                            </div>
                            
                            <div class="flex flex-wrap justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 text-indigo-600 dark:text-indigo-300 gap-3 w-full transition-colors">
                                <div class="flex items-center gap-3"><span>Base Headcount:</span><button onclick="window.openModal('baseReq')" class="bg-zinc-100 dark:bg-[#18181b] rounded-lg p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 outline-none"><i data-lucide="help-circle" class="w-4 h-4 text-indigo-500"></i></button></div>
                                <div class="font-bold bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 shadow-sm dark:shadow-inner transition-colors flex flex-wrap gap-1 justify-end"><span>${w.totalHrs.toFixed(1)} ÷ 15 =</span> <span>${Math.ceil(w.totalHrs / 15)}</span></div>
                            </div>
                            
                            <div class="flex flex-wrap justify-between items-center pb-3 text-amber-600 dark:text-amber-300 gap-3 w-full transition-colors">
                                <div class="flex items-center gap-3"><span>Reserves:</span><button onclick="window.openModal('reserve')" class="bg-zinc-100 dark:bg-[#18181b] rounded-lg p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 outline-none"><i data-lucide="help-circle" class="w-4 h-4 text-amber-500"></i></button></div>
                                <span class="font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-inner transition-colors">+ ${w.reserveHeadcount}</span>
                            </div>
                            
                            <div class="flex justify-between items-center mt-6 bg-indigo-50 dark:bg-indigo-500/20 p-5 md:p-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/40 text-indigo-900 dark:text-white shadow-md w-full transition-colors">
                                <span class="uppercase font-bold text-sm tracking-wider">Total:</span>
                                <span class="font-black text-4xl drop-shadow-sm dark:drop-shadow-md bg-white dark:bg-zinc-950 px-6 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 transition-colors">${req}</span>
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