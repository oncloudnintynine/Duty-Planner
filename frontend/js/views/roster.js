import { UI } from '../store.js';

export function RosterDesktop(state) {
    return SharedRosterForm(state, false);
}

export function RosterMobile(state) {
    return SharedRosterForm(state, true);
}

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
    <div class="space-y-6 w-full flex flex-col">
        <div class="mb-2 shrink-0">
            <h2 class="text-2xl font-black text-white uppercase">Roster Engine</h2>
        </div>

        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-end gap-5 w-full">
            <div class="w-full sm:max-w-sm">
                <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase">Target Month / Year</label>
                <input type="month" id="inpMonth" value="${ym}" onchange="UI.state.lastMonth = this.value; UI.render();" class="w-full text-center">
            </div>
            <button onclick="window.handleGenerate()" class="bg-indigo-600 text-white px-8 py-4 sm:py-3 rounded-xl font-black uppercase w-full sm:w-auto h-[48px] border border-indigo-500/50">
                Execute Engine
            </button>
        </div>

        <div class="flex-1 w-full">
            ${scheduleRows.length > 0 ? `
                ${isMobile ? `
                <!-- MOBILE CARDS - ZERO TABLES -->
                <div class="flex flex-col space-y-4 w-full">
                    ${scheduleRows.map(s => {
                        const isReserve = s.shift.includes('(Reserve)');
                        return `
                        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-lg w-full">
                            <div class="flex justify-between items-start gap-4 mb-4 border-b border-zinc-800 pb-4">
                                <div class="min-w-0 flex-1">
                                    <div class="font-black text-base truncate ${isReserve ? 'text-amber-400' : 'text-indigo-300'}">${s.role}</div>
                                    <div class="text-[10px] font-black text-zinc-500 mt-1 uppercase tracking-widest">${s.shift}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="font-bold text-white text-sm">${formatDate(s.date)}</div>
                                    <div class="text-xs font-mono font-bold text-zinc-400 mt-1">${formatTime(s.start)} - ${formatTime(s.end)}</div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center w-full">
                                <span class="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black">${s.seniorityReqName || 'Any'}</span>
                                ${s.personName === 'UNFILLED' 
                                    ? `<span class="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-black uppercase">Unfilled</span>`
                                    : `<span class="font-black text-white text-sm bg-[#18181b] px-4 py-2 rounded-lg border border-zinc-700">${s.personName}</span>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                ` : `
                <!-- DESKTOP TABLE -->
                <div class="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl overflow-hidden w-full">
                    <div class="overflow-x-auto w-full hide-scroll">
                        <table class="w-full text-left text-sm text-zinc-300 whitespace-nowrap min-w-[800px]">
                            <thead class="bg-zinc-800 text-zinc-300 text-xs uppercase font-black tracking-wider">
                                <tr><th class="px-6 py-5">Date</th><th class="px-6 py-5">Role & Shift Node</th><th class="px-6 py-5">Seniority Req</th><th class="px-6 py-5">Time Window (24H)</th><th class="px-6 py-5 text-right">Assigned Personnel</th></tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-800/80">
                                ${scheduleRows.map((s, i) => {
                                    const isReserve = s.shift.includes('(Reserve)');
                                    return `
                                    <tr class="hover:bg-zinc-800/40 ${i % 2 === 0 ? 'bg-zinc-950/40' : ''}">
                                        <td class="px-6 py-4 font-bold text-white">${formatDate(s.date)}</td>
                                        <td class="px-6 py-4"><div class="font-bold text-base ${isReserve ? 'text-amber-400' : 'text-indigo-300'}">${s.role}</div><div class="text-[10px] font-black text-zinc-500 mt-1 uppercase">${s.shift}</div></td>
                                        <td class="px-6 py-4"><span class="bg-zinc-800 text-zinc-200 border border-zinc-600 px-3 py-1.5 rounded-lg text-[10px] uppercase font-black">${s.seniorityReqName || 'Any'}</span></td>
                                        <td class="px-6 py-4 text-sm font-mono font-bold text-zinc-300"><span class="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">${formatTime(s.start)} - ${formatTime(s.end)}</span></td>
                                        <td class="px-6 py-4 text-right">
                                            ${s.personName === 'UNFILLED' 
                                                ? `<span class="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-black uppercase">Unfilled</span>`
                                                : `<span class="font-black text-white text-base bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">${s.personName}</span>`
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
                <div class="flex flex-col items-center justify-center opacity-40 bg-zinc-900 border border-zinc-700 rounded-2xl w-full p-12">
                    <i data-lucide="calendar-x" class="w-24 h-24 mb-6 text-zinc-500"></i>
                    <p class="text-lg font-black uppercase text-zinc-400 text-center">${ym ? "Engine has not generated data." : "Select a month."}</p>
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