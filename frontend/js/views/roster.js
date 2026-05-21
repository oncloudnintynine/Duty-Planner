import { UI } from '../store.js';

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

    const inputClass = "w-full text-base sm:text-lg font-bold bg-white dark:bg-[#18181b] border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-colors shadow-sm dark:shadow-none min-h-[56px]";

    return `
    <div class="space-y-8 w-full flex flex-col min-w-0 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="mb-2 shrink-0">
            <h2 class="text-3xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide transition-colors">Roster Engine</h2>
            <p class="text-zinc-500 dark:text-zinc-400 text-base mt-2 flex flex-col sm:flex-row sm:items-center gap-2 leading-relaxed transition-colors">
                <span class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold"><i data-lucide="info" class="w-5 h-5"></i> Enforces 11-hr rest & 44hr limits</span>
                <span class="hidden sm:inline text-zinc-300 dark:text-zinc-600">|</span>
                <span>Auto-handles Off-In-Lieu dynamically.</span>
            </p>
        </div>

        <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-lg dark:shadow-2xl flex flex-col sm:flex-row items-end gap-5 w-full min-w-0 transition-colors">
            <div class="w-full sm:max-w-sm">
                <label class="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-widest transition-colors">Target Month / Year</label>
                <input type="month" id="inpMonth" value="${ym}" onchange="UI.state.lastMonth = this.value; UI.render();" class="${inputClass}">
            </div>
            <button onclick="window.handleGenerate()" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-base w-full sm:w-auto border border-indigo-500/50 shadow-lg outline-none active:scale-95 transition-transform flex items-center justify-center gap-3 min-h-[56px]">
                <i data-lucide="cpu" class="w-6 h-6"></i> Execute Engine
            </button>
        </div>

        <div class="flex-1 w-full min-w-0 mt-4">
            ${scheduleRows.length > 0 ? `
                ${isMobile ? `
                <!-- MOBILE CARDS - ZERO TABLES -->
                <div class="flex flex-col space-y-5 w-full min-w-0">
                    ${scheduleRows.map(s => {
                        const isReserve = s.shift.includes('(Reserve)');
                        return `
                        <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-md dark:shadow-xl w-full min-w-0 transition-colors">
                            <div class="flex justify-between items-start gap-4 mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-5 transition-colors">
                                <div class="min-w-0 flex-1">
                                    <div class="font-bold text-xl leading-snug break-words whitespace-normal ${isReserve ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-300'} transition-colors">${s.role}</div>
                                    <div class="text-xs font-bold text-zinc-500 dark:text-zinc-500 mt-2 uppercase tracking-widest transition-colors">${s.shift}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="font-bold text-zinc-900 dark:text-white text-base bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors">${formatDate(s.date)}</div>
                                    <div class="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 mt-2 transition-colors">${formatTime(s.start)} - ${formatTime(s.end)}</div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center w-full gap-3">
                                <span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3.5 py-2 rounded-xl text-xs uppercase tracking-widest font-bold shrink-0 transition-colors">${s.seniorityReqName || 'Any'}</span>
                                ${s.personName === 'UNFILLED' 
                                    ? `<span class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Unfilled</span>`
                                    : `<span class="font-bold text-zinc-900 dark:text-white text-base bg-white dark:bg-[#18181b] px-4 py-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 break-words whitespace-normal text-right leading-tight max-w-[60%] shadow-sm transition-colors">${s.personName}</span>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                ` : `
                <!-- DESKTOP TABLE -->
                <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-xl dark:shadow-2xl overflow-hidden w-full min-w-0 transition-colors">
                    <div class="overflow-x-auto w-full hide-scroll">
                        <table class="w-full text-left text-base text-zinc-600 dark:text-zinc-300 min-w-[900px]">
                            <thead class="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                                <tr><th class="px-8 py-6">Date</th><th class="px-8 py-6">Role & Shift Node</th><th class="px-8 py-6">Seniority Req</th><th class="px-8 py-6">Time Window (24H)</th><th class="px-8 py-6 text-right">Assigned Personnel</th></tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50 transition-colors">
                                ${scheduleRows.map((s, i) => {
                                    const isReserve = s.shift.includes('(Reserve)');
                                    return `
                                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? 'bg-zinc-50/50 dark:bg-zinc-950/20' : ''}">
                                        <td class="px-8 py-5 font-bold text-zinc-900 dark:text-white text-lg transition-colors">${formatDate(s.date)}</td>
                                        <td class="px-8 py-5 min-w-0 max-w-xs break-words whitespace-normal"><div class="font-bold text-lg leading-snug ${isReserve ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-300'} transition-colors">${s.role}</div><div class="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest transition-colors">${s.shift}</div></td>
                                        <td class="px-8 py-5"><span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 rounded-lg text-xs uppercase font-bold tracking-widest transition-colors">${s.seniorityReqName || 'Any'}</span></td>
                                        <td class="px-8 py-5 text-base font-mono font-bold text-zinc-600 dark:text-zinc-300 transition-colors"><span class="bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none transition-colors">${formatTime(s.start)} - ${formatTime(s.end)}</span></td>
                                        <td class="px-8 py-5 text-right min-w-0 max-w-xs break-words whitespace-normal">
                                            ${s.personName === 'UNFILLED' 
                                                ? `<span class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Unfilled</span>`
                                                : `<span class="font-bold text-zinc-900 dark:text-white text-lg bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 leading-snug shadow-sm transition-colors">${s.personName}</span>`
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
                <div class="flex flex-col items-center justify-center opacity-50 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full p-16 mt-4 transition-colors">
                    <i data-lucide="calendar-x" class="w-24 h-24 mb-6 text-zinc-400 dark:text-zinc-500 transition-colors"></i>
                    <p class="text-xl font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-center transition-colors">${ym ? "Engine has not generated data." : "Select a month."}</p>
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