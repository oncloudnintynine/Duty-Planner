import { UI } from '../store.js';

export function RosterView(state) {
    const ym = document.getElementById('inpMonth')?.value || state.lastMonth || "";
    let scheduleRows = [];
    if(ym) {
        scheduleRows = state.data.schedule.filter(s => String(s.yearMonth).startsWith(ym));
    }

    const formatTime = (isoString) => {
       try { 
          const d = new Date(isoString); 
          if(!isNaN(d)) return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}); 
       } catch(e) {}
       return isoString;
    };

    const formatDate = (isoString) => {
       try { 
          const d = new Date(isoString); 
          if(!isNaN(d)) return d.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}); 
       } catch(e) {}
       return isoString;
    };

    return `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full h-full flex flex-col min-w-0">
        <div class="mb-2 shrink-0">
            <h2 class="text-2xl font-black text-white tracking-wide uppercase">Heuristic Roster Engine</h2>
            <p class="text-zinc-400 text-sm mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 leading-relaxed">
                <span class="flex items-center gap-1.5 text-indigo-400 font-bold"><i data-lucide="info" class="w-4 h-4"></i> Enforces 11-hour rest & 44hr limits</span>
                <span class="hidden sm:inline text-zinc-600">|</span>
                <span>Auto-handles Off-In-Lieu dynamically.</span>
            </p>
        </div>

        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-end gap-4 sm:gap-6 shrink-0 w-full min-w-0">
            <div class="flex-1 w-full sm:max-w-sm">
                <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Target Month / Year</label>
                <input type="month" id="inpMonth" value="${ym}" onchange="UI.state.lastMonth = this.value; UI.render();" class="w-full px-4 py-3.5 sm:py-3 font-bold rounded-xl bg-[#18181b] border-2 border-zinc-600 focus:border-indigo-400 text-white outline-none">
            </div>
            <button onclick="window.handleGenerate()" class="bg-indigo-600 text-white px-8 py-3.5 sm:py-3 rounded-xl font-black hover:bg-indigo-500 transition-colors shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto uppercase tracking-wide border border-indigo-500/50 outline-none">
                <i data-lucide="cpu" class="w-5 h-5"></i> Execute Engine
            </button>
        </div>

        <!-- Adaptive UI: Cards on Mobile, Table on Desktop -->
        <div class="flex-1 overflow-hidden w-full min-w-0 flex flex-col">
            ${scheduleRows.length > 0 ? `
                
                <!-- MOBILE CARDS -->
                <div class="md:hidden flex-1 overflow-y-auto hide-scroll space-y-4 pb-4 w-full">
                    ${scheduleRows.map(s => {
                        const isReserve = s.shift.includes('(Reserve)');
                        return `
                        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                            <div class="flex justify-between items-start gap-4">
                                <div class="min-w-0 flex-1">
                                    <div class="font-black text-base truncate ${isReserve ? 'text-amber-400' : 'text-indigo-300'}">${s.role}</div>
                                    <div class="text-[10px] font-black text-zinc-500 mt-1 uppercase tracking-widest">${s.shift}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="font-bold text-white text-sm">${formatDate(s.date)}</div>
                                    <div class="text-xs font-mono font-bold text-zinc-400 mt-1">${formatTime(s.start)} - ${formatTime(s.end)}</div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center pt-4 border-t border-zinc-800">
                                <span class="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black shadow-sm">${s.seniorityReqName || 'Any'}</span>
                                ${s.personName === 'UNFILLED' 
                                    ? `<span class="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Unfilled</span>`
                                    : `<span class="font-black text-white text-sm bg-[#18181b] px-4 py-2 rounded-lg border border-zinc-700 shadow-sm">${s.personName}</span>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>

                <!-- DESKTOP TABLE -->
                <div class="hidden md:flex bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex-1 overflow-hidden w-full min-w-0 flex-col">
                    <div class="overflow-x-auto flex-1 relative hide-scroll w-full min-w-0">
                        <table class="w-full text-left text-sm text-zinc-300 whitespace-nowrap min-w-[800px]">
                            <thead class="bg-zinc-800 text-zinc-300 text-xs uppercase sticky top-0 z-10 border-b border-zinc-700/80 shadow-sm font-black tracking-wider">
                                <tr>
                                    <th class="px-6 py-5">Date</th>
                                    <th class="px-6 py-5">Role & Shift Node</th>
                                    <th class="px-6 py-5">Seniority Req</th>
                                    <th class="px-6 py-5">Time Window (24H)</th>
                                    <th class="px-6 py-5 text-right">Assigned Personnel</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-800/80">
                                ${scheduleRows.map((s, i) => {
                                    const isReserve = s.shift.includes('(Reserve)');
                                    return `
                                    <tr class="hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? 'bg-zinc-950/40' : ''}">
                                        <td class="px-6 py-4 font-bold text-white">${formatDate(s.date)}</td>
                                        <td class="px-6 py-4">
                                            <div class="font-bold text-base ${isReserve ? 'text-amber-400' : 'text-indigo-300'}">${s.role}</div>
                                            <div class="text-[10px] font-black text-zinc-500 mt-1 uppercase tracking-widest">${s.shift}</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="bg-zinc-800 text-zinc-200 border border-zinc-600 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black shadow-sm">${s.seniorityReqName || 'Any'}</span>
                                        </td>
                                        <td class="px-6 py-4 text-sm font-mono font-bold text-zinc-300">
                                            <span class="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-inner">${formatTime(s.start)} - ${formatTime(s.end)}</span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            ${s.personName === 'UNFILLED' 
                                                ? `<span class="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Unfilled</span>`
                                                : `<span class="font-black text-white text-base bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 shadow-sm inline-block">${s.personName}</span>`
                                            }
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

            ` : `
                <div class="flex-1 flex flex-col items-center justify-center opacity-50 bg-zinc-900 border border-zinc-700 rounded-2xl w-full">
                    <i data-lucide="calendar-x" class="w-20 h-20 sm:w-24 sm:h-24 mb-6 text-zinc-500"></i>
                    <p class="text-lg sm:text-xl font-black uppercase tracking-widest text-zinc-400 text-center px-4">${ym ? "Engine has not generated data for this timeframe." : "Select a valid timeframe to inspect data."}</p>
                </div>
            `}
        </div>
    </div>
    `;
}

// BIND LOGIC
window.handleGenerate = () => {
    const ym = document.getElementById('inpMonth').value;
    if(!ym) return UI.showToast("Select a valid month to execute engine.", "error");
    const [year, month] = ym.split('-');
    
    if(UI.state.data.roles.length === 0 || UI.state.data.personnel.length === 0) {
        return UI.showToast("Engine halted: Missing personnel or roles.", "error");
    }
    
    UI.dispatch('generateSchedule', { year: parseInt(year), month: parseInt(month) });
};