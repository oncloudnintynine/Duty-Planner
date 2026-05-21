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

    return `
    <div class="space-y-8 w-full flex flex-col min-w-0 pb-6">
        <div class="mb-2 shrink-0">
            <h2 class="text-3xl font-bold text-white uppercase tracking-wide">Roster Engine</h2>
            <p class="text-zinc-400 text-base mt-2 flex flex-col sm:flex-row sm:items-center gap-2 leading-relaxed">
                <span class="flex items-center gap-2 text-indigo-400 font-bold"><i data-lucide="info" class="w-5 h-5"></i> Enforces 11-hr rest & 44hr limits</span>
                <span class="hidden sm:inline text-zinc-600">|</span>
                <span>Auto-handles Off-In-Lieu dynamically.</span>
            </p>
        </div>

        <div class="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-end gap-5 w-full min-w-0">
            <div class="w-full sm:max-w-sm">
                <label class="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-widest">Target Month / Year</label>
                <input type="month" id="inpMonth" value="${ym}" onchange="UI.state.lastMonth = this.value; UI.render();" class="w-full px-5 py-4 font-bold rounded-2xl bg-[#18181b] border-2 border-zinc-700 focus:border-indigo-500 text-white outline-none text-lg">
            </div>
            <button onclick="window.handleGenerate()" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-base w-full sm:w-auto border border-indigo-500/50 shadow-lg outline-none active:scale-95 transition-transform flex items-center justify-center gap-3">
                <i data-lucide="cpu" class="w-6 h-6"></i> Execute Engine
            </button>
        </div>

        <div class="flex-1 w-full min-w-0 mt-4">
            ${scheduleRows.length > 0 ? `
                ${isMobile ? `
                <!-- MOBILE CARDS -->
                <div class="flex flex-col space-y-5 w-full min-w-0">
                    ${scheduleRows.map(s => {
                        const isReserve = s.shift.includes('(Reserve)');
                        return `
                        <div class="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-xl w-full min-w-0">
                            <div class="flex justify-between items-start gap-4 mb-5 border-b border-zinc-800 pb-5">
                                <div class="min-w-0 flex-1">
                                    <div class="font-black text-xl leading-snug break-words whitespace-normal ${isReserve ? 'text-amber-400' : 'text-indigo-300'}">${s.role}</div>
                                    <div class="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest">${s.shift}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="font-bold text-white text-base bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">${formatDate(s.date)}</div>
                                    <div class="text-xs font-mono font-bold text-zinc-400 mt-2">${formatTime(s.start)} - ${formatTime(s.end)}</div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center w-full gap-3">
                                <span class="bg-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl text-xs uppercase tracking-widest font-bold shrink-0">${s.seniorityReqName || 'Any'}</span>
                                ${s.personName === 'UNFILLED' 
                                    ? `<span class="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Unfilled</span>`
                                    : `<span class="font-bold text-white text-base bg-[#18181b] px-4 py-2.5 rounded-xl border border-zinc-700 break-words whitespace-normal text-right leading-tight max-w-[60%]">${s.personName}</span>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                ` : `
                <!-- DESKTOP TABLE -->
                <div class="bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden w-full min-w-0">
                    <div class="overflow-x-auto w-full hide-scroll">
                        <table class="w-full text-left text-base text-zinc-300 min-w-[900px]">
                            <thead class="bg-zinc-950 text-zinc-400 text-xs uppercase font-bold tracking-widest border-b border-zinc-800">
                                <tr><th class="px-8 py-6">Date</th><th class="px-8 py-6">Role & Shift Node</th><th class="px-8 py-6">Seniority Req</th><th class="px-8 py-6">Time Window (24H)</th><th class="px-8 py-6 text-right">Assigned Personnel</th></tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-800/50">
                                ${scheduleRows.map((s, i) => {
                                    const isReserve = s.shift.includes('(Reserve)');
                                    return `
                                    <tr class="hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? 'bg-zinc-950/20' : ''}">
                                        <td class="px-8 py-5 font-bold text-white text-lg">${formatDate(s.date)}</td>
                                        <td class="px-8 py-5 min-w-0 max-w-xs break-words whitespace-normal"><div class="font-bold text-lg leading-snug ${isReserve ? 'text-amber-400' : 'text-indigo-300'}">${s.role}</div><div class="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest">${s.shift}</div></td>
                                        <td class="px-8 py-5"><span class="bg-zinc-800 text-zinc-200 border border-zinc-600 px-3 py-1.5 rounded-lg text-xs uppercase font-bold tracking-widest">${s.seniorityReqName || 'Any'}</span></td>
                                        <td class="px-8 py-5 text-base font-mono font-bold text-zinc-300"><span class="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">${formatTime(s.start)} - ${formatTime(s.end)}</span></td>
                                        <td class="px-8 py-5 text-right min-w-0 max-w-xs break-words whitespace-normal">
                                            ${s.personName === 'UNFILLED' 
                                                ? `<span class="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Unfilled</span>`
                                                : `<span class="font-bold text-white text-lg bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700 leading-snug">${s.personName}</span>`
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
                <div class="flex flex-col items-center justify-center opacity-40 bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full p-16 mt-4">
                    <i data-lucide="calendar-x" class="w-24 h-24 mb-6 text-zinc-500"></i>
                    <p class="text-xl font-bold uppercase tracking-widest text-zinc-400 text-center">${ym ? "Engine has not generated data." : "Select a month."}</p>
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