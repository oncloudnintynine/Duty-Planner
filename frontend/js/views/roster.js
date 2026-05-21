import { UI, css } from '../store.js';

export function RosterDesktop(state) { return SharedRosterForm(state, false); }
export function RosterMobile(state) { return SharedRosterForm(state, true); }

function SharedRosterForm(state, isMobile) {
    const ym = document.getElementById('inpMonth')?.value || state.lastMonth || "";
    let scheduleRows = [];
    if(ym) scheduleRows = state.data.schedule.filter(s => String(s.yearMonth).startsWith(ym));

    const formatTime = (isoString) => {
       try { const d = new Date(isoString); if(!isNaN(d)) return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}); } catch(e) {}
       return isoString;
    };
    const formatDate = (isoString) => {
       try { const d = new Date(isoString); if(!isNaN(d)) return d.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}); } catch(e) {}
       return isoString;
    };

    return `
    <div class="space-y-6 w-full flex flex-col min-w-0 h-full pb-4 animate-in fade-in duration-300">
        <div class="mb-2 shrink-0">
            <h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Roster Engine</h2>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-1 flex items-center gap-1.5">
                <i data-lucide="info" class="w-4 h-4 text-indigo-500"></i> Enforces 11-hr rest, 44hr limit & handles OIL dynamically.
            </p>
        </div>

        <div class="${css.card} p-4 sm:p-5 flex flex-col sm:flex-row items-end gap-4 w-full shrink-0">
            <div class="w-full sm:max-w-[200px]">
                <label class="${css.label}">Target Month</label>
                <input type="month" id="inpMonth" value="${ym}" onchange="UI.state.lastMonth = this.value; UI.render();" class="${css.input}">
            </div>
            <button onclick="window.handleGenerate()" class="${css.btnPrimary} w-full sm:w-auto px-6 h-[44px]">
                <i data-lucide="cpu" class="w-4 h-4"></i> Execute Engine
            </button>
        </div>

        <div class="flex-1 w-full min-w-0 overflow-hidden flex flex-col">
            ${scheduleRows.length > 0 ? `
                ${isMobile ? `
                <div class="flex-1 overflow-y-auto hide-scroll space-y-3 w-full">
                    ${scheduleRows.map(s => {
                        const isReserve = s.shift.includes('(Reserve)');
                        return `
                        <div class="${css.card} p-4 w-full">
                            <div class="flex justify-between items-start gap-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                <div class="min-w-0 flex-1">
                                    <div class="font-bold text-sm leading-snug truncate ${isReserve ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}">${s.role}</div>
                                    <div class="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">${s.shift}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="font-semibold text-zinc-900 dark:text-white text-xs">${formatDate(s.date)}</div>
                                    <div class="text-[10px] font-mono text-zinc-500 mt-0.5">${formatTime(s.start)} - ${formatTime(s.end)}</div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center w-full gap-2">
                                <span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold">${s.seniorityReqName || 'Any'}</span>
                                ${s.personName === 'UNFILLED' 
                                    ? `<span class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Unfilled</span>`
                                    : `<span class="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-[60%]">${s.personName}</span>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                ` : `
                <div class="${css.card} flex-1 overflow-hidden w-full flex flex-col">
                    <div class="overflow-x-auto w-full hide-scroll flex-1">
                        <table class="w-full text-left text-sm text-zinc-600 dark:text-zinc-300 min-w-[800px]">
                            <thead class="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest border-b border-zinc-200 dark:border-zinc-800 sticky top-0">
                                <tr><th class="px-5 py-4">Date</th><th class="px-5 py-4">Role & Shift Node</th><th class="px-5 py-4">Seniority Req</th><th class="px-5 py-4">Time Window (24H)</th><th class="px-5 py-4 text-right">Assigned Personnel</th></tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                ${scheduleRows.map((s, i) => {
                                    const isReserve = s.shift.includes('(Reserve)');
                                    return `
                                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                        <td class="px-5 py-3 font-semibold text-zinc-900 dark:text-white">${formatDate(s.date)}</td>
                                        <td class="px-5 py-3 min-w-0 max-w-[200px] truncate"><div class="font-semibold text-sm ${isReserve ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'} truncate">${s.role}</div><div class="text-[10px] text-zinc-500 mt-0.5 uppercase">${s.shift}</div></td>
                                        <td class="px-5 py-3"><span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest">${s.seniorityReqName || 'Any'}</span></td>
                                        <td class="px-5 py-3 text-xs font-mono text-zinc-500">${formatTime(s.start)} - ${formatTime(s.end)}</td>
                                        <td class="px-5 py-3 text-right min-w-0 max-w-[200px] truncate">
                                            ${s.personName === 'UNFILLED' 
                                                ? `<span class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded text-xs font-bold uppercase inline-flex items-center gap-1.5"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Unfilled</span>`
                                                : `<span class="font-bold text-zinc-900 dark:text-white text-sm truncate">${s.personName}</span>`
                                            }
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                `}
            ` : `
                <div class="${css.card} flex-1 flex flex-col items-center justify-center opacity-50 p-8 w-full">
                    <i data-lucide="calendar-x" class="w-16 h-16 mb-4 text-zinc-400"></i>
                    <p class="text-sm font-bold uppercase tracking-widest text-zinc-400 text-center">${ym ? "Engine has not generated data." : "Select a month."}</p>
                </div>
            `}
        </div>
    </div>
    `;
}

window.handleGenerate = () => {
    const ym = document.getElementById('inpMonth').value;
    if(!ym) return UI.showToast("Select a valid month to execute engine.", "error");
    const [year, month] = ym.split('-');
    if(UI.state.data.roles.length === 0 || UI.state.data.personnel.length === 0) return UI.showToast("Missing personnel or roles.", "error");
    UI.dispatch('generateSchedule', { year: parseInt(year), month: parseInt(month) });
};