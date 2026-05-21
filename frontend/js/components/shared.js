import { SetupView } from '../views/setup.js';
import { ManageView } from '../views/manage.js';
import { RosterView } from '../views/roster.js';
import { ManpowerCalculatorView } from '../views/calculator.js';
import { AdvancedSettingsView } from '../views/settings.js';

export function AppTemplate(state) {
    // Structural constraints min-w-0 absolutely halt flexbox children expanding the screen width past 100vw
    return `
    <div class="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden relative bg-zinc-950 pt-safe">
        ${Sidebar(state)}
        <main class="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden pb-[90px] md:pb-0 w-full relative hide-scroll">
            <div class="p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto min-w-0">
                ${state.activeTab === 'setup' ? SetupView(state) : ''}
                ${state.activeTab === 'manage' ? ManageView(state) : ''}
                ${state.activeTab === 'roster' ? RosterView(state) : ''}
                ${state.activeTab === 'calc' ? ManpowerCalculatorView(state) : ''}
                ${state.activeTab === 'settings' ? AdvancedSettingsView(state) : ''}
            </div>
        </main>
        ${MobileNav(state)}
    </div>
    ${state.loading ? Loader() : ''}
    ${InfoModal(state)}
    `;
}

function Sidebar(state) {
    const tabs = [
        { id: 'setup', name: 'Topology & Setup', icon: 'database' },
        { id: 'manage', name: 'Personnel', icon: 'users' },
        { id: 'roster', name: 'Roster Engine', icon: 'calendar-days' },
        { id: 'calc', name: 'Calculator', icon: 'calculator' },
        { id: 'settings', name: 'Advanced Settings', icon: 'settings' }
    ];
    return `
    <aside class="hidden md:flex w-72 bg-zinc-900 border-r border-zinc-800 flex-col z-10 shadow-2xl shrink-0">
        <div class="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 text-indigo-400 shrink-0">
                <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div>
                <h1 class="text-lg font-black text-white leading-tight uppercase tracking-wider">DutyPlanner</h1>
            </div>
        </div>
        <nav class="flex-1 p-4 space-y-2">
            ${tabs.map(t => `
                <button onclick="window.switchTab('${t.id}')" class="tab-btn w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${state.activeTab === t.id ? 'active' : (t.id === 'settings' ? 'text-zinc-500 hover:bg-zinc-800/50 hover:text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200')} border-r-2 border-transparent outline-none">
                    <i data-lucide="${t.icon}" class="w-5 h-5"></i>
                    ${t.name}
                </button>
            `).join('')}
        </nav>
    </aside>
    `;
}

function MobileNav(state) {
    const tabs = [
        { id: 'setup', name: 'Setup', icon: 'database' },
        { id: 'manage', name: 'Personnel', icon: 'users' },
        { id: 'roster', name: 'Roster', icon: 'calendar-days' },
        { id: 'calc', name: 'Calculator', icon: 'calculator' },
        { id: 'settings', name: 'Settings', icon: 'settings' }
    ];
    
    return `
    <div class="md:hidden fixed bottom-0 left-0 right-0 w-full bg-zinc-900 border-t border-zinc-800 z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div class="flex justify-around items-center h-[72px] px-1">
            ${tabs.map(t => `
                <button onclick="window.switchTab('${t.id}')" class="mobile-tab-btn flex-1 flex flex-col items-center justify-center gap-1.5 transition-colors ${state.activeTab === t.id ? 'active text-indigo-400' : 'text-zinc-500'} outline-none">
                    <i data-lucide="${t.icon}" class="w-[22px] h-[22px] ${state.activeTab === t.id ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}"></i>
                    <span class="text-[10px] font-black tracking-widest uppercase">${t.name}</span>
                </button>
            `).join('')}
        </div>
    </div>
    `;
}

function Loader() {
    return `
    <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[300] flex flex-col items-center justify-center animate-in fade-in duration-200 w-full h-full">
        <div class="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
        <p class="text-indigo-300 font-black tracking-widest text-sm uppercase animate-pulse">Syncing Database...</p>
    </div>
    `;
}

function InfoModal(state) {
    if (!state.activeModal) return '';
    const modalData = {
        'onSite': { 
            title: 'On-Site Demand', 
            htmlContent: `
               <div class="space-y-5">
                   <p class="text-zinc-300">Calculates the total weekly hours required to man all active on-site shifts based on shift duration, weekly schedule, and personnel count.</p>
                   <div class="bg-[#18181b] border border-zinc-700 rounded-xl overflow-hidden shadow-inner">
                       <div class="bg-indigo-500/10 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
                           <span class="bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">Example</span>
                           <span class="text-indigo-200 text-xs font-bold uppercase tracking-wider">12-Hr Shift (24/7 Role, 2 Pax)</span>
                       </div>
                       <ul class="p-4 space-y-3 text-sm text-zinc-300 font-mono">
                           <li class="flex justify-between items-center"><span class="text-zinc-400">Shift Duration:</span> <span>12 hours</span></li>
                           <li class="flex justify-between items-center"><span class="text-zinc-400">Days per week:</span> <span>× 7 days</span></li>
                           <li class="flex justify-between items-center"><span class="text-zinc-400">Headcount/shift:</span> <span>× 2 pax</span></li>
                           <li class="border-t border-zinc-700/50 pt-3 flex justify-between items-center font-bold text-indigo-300 text-base mt-2"><span>Total Demand:</span> <span>168 hrs/wk</span></li>
                       </ul>
                   </div>
               </div>
            `
        },
        'standby': { 
            title: 'Standby Buffers', 
            htmlContent: `
               <div class="space-y-5">
                   <p class="text-zinc-300 leading-relaxed">Standby roles do not accumulate rigid schedule hours until physically activated. To realistically account for this in manpower planning, the mathematical framework applies a statistical buffer.</p>
                   <div class="bg-[#18181b] border border-zinc-700 rounded-xl overflow-hidden shadow-inner">
                       <div class="bg-orange-500/10 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
                           <span class="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">Model Assumptions</span>
                       </div>
                       <ul class="p-4 space-y-3 text-sm text-zinc-300 font-mono">
                           <li class="flex justify-between items-center"><span class="text-zinc-400">Est. Activations:</span> <span>2 per month</span></li>
                           <li class="flex justify-between items-center"><span class="text-zinc-400">Time / Activation:</span> <span>× 24 hours</span></li>
                           <li class="flex justify-between items-center"><span class="text-zinc-400">Monthly Load:</span> <span>= 48 hours</span></li>
                           <li class="border-t border-zinc-700/50 pt-3 flex justify-between items-center font-bold text-orange-300 text-base mt-2"><span>Weekly Equivalent:</span> <span>~12 hrs/wk</span></li>
                       </ul>
                   </div>
                   <p class="text-xs text-zinc-500 italic text-center px-4">*Pro-rated downwards for roles that are not 24/7 operations.</p>
               </div>
            `
        },
        'baseReq': { 
            title: 'Base Req. Headcount', 
            htmlContent: `
               <div class="space-y-5">
                   <p class="text-zinc-300 leading-relaxed">The raw number of personnel needed to safely cover the total operational working hours (On-Site + Standby), divided by a single person's capacity.</p>
                   <div class="bg-[#18181b] border border-zinc-700 rounded-xl p-5 shadow-inner flex flex-col items-center">
                       <div class="w-full flex justify-between items-center bg-zinc-900 border border-zinc-700 px-4 py-4 rounded-lg">
                           <span class="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-tight">Total<br>Workload</span>
                           <span class="font-black text-white text-xl">120 hrs/wk</span>
                       </div>
                       <div class="my-3 border border-zinc-700 rounded-full w-8 h-8 flex items-center justify-center bg-zinc-800 shadow-md">
                           <i data-lucide="divide" class="w-4 h-4 text-zinc-400"></i>
                       </div>
                       <div class="w-full flex justify-between items-center bg-indigo-500/10 border border-indigo-500/30 px-4 py-4 rounded-lg">
                           <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest leading-tight">Net Duty<br>Capacity</span>
                           <span class="font-black text-indigo-300 text-xl">15 hrs/pax</span>
                       </div>
                       <div class="w-full border-t border-zinc-700 mt-5 pt-4 flex justify-between items-center">
                           <span class="text-white font-bold tracking-wide text-sm">Base Headcount:</span>
                           <span class="font-black text-white text-2xl">8 Pax</span>
                       </div>
                   </div>
               </div>
            `
        },
        'reserve': { 
            title: 'Dedicated Reserves', 
            htmlContent: `
               <div class="space-y-5">
                   <p class="text-zinc-300 leading-relaxed">Reserves require physical availability but do not accrue pure working hours unless activated. Therefore, they are mathematically calculated by <strong>shift blocks</strong>, not continuous hours.</p>
                   <div class="bg-[#18181b] border border-zinc-700 rounded-xl overflow-hidden shadow-inner">
                       <div class="bg-amber-500/10 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
                           <span class="bg-amber-500 text-zinc-900 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">Formula</span>
                           <span class="text-amber-300 text-xs font-bold uppercase tracking-wider">Based on 1 Shift/Day</span>
                       </div>
                       <ul class="p-4 space-y-4 text-sm text-zinc-300 font-mono">
                           <li class="flex flex-col gap-1.5">
                               <span class="text-zinc-400 text-xs">Total Reserve Shifts Required:</span> 
                               <span class="font-bold text-white text-lg">7 shifts/week</span>
                           </li>
                           <li class="flex flex-col gap-1.5">
                               <span class="text-zinc-400 text-xs">Single Person Shift Capacity:</span> 
                               <span class="text-[10px] uppercase font-bold text-zinc-500 leading-tight">(192 working days ÷ 52.14 wks)</span>
                               <span class="font-bold text-amber-300 text-lg">~3.682 shifts/week</span>
                           </li>
                           <li class="border-t border-zinc-700/50 pt-4 flex justify-between items-center font-bold text-white mt-2">
                               <span>Headcount <br><span class="text-[10px] text-zinc-500">(7 ÷ 3.682)</span>:</span> 
                               <span class="text-2xl flex flex-col items-end leading-tight">2 Pax <span class="text-[10px] uppercase font-bold text-zinc-500 mt-1">(Rounded Up)</span></span>
                           </li>
                       </ul>
                   </div>
               </div>
            `
        },
        'totalReq': {
            title: 'Total Headcount Needed',
            htmlContent: `
               <div class="space-y-5">
                   <p class="text-zinc-300 leading-relaxed">The absolute final headcount required for this seniority tier, derived by mathematically merging the active operational pool and the dedicated reserve pool.</p>
                   <div class="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/30 rounded-xl p-6 shadow-inner">
                       <div class="flex justify-between items-center font-mono text-base mb-4">
                           <span class="text-indigo-300 font-bold flex items-center gap-2"><i data-lucide="shield" class="w-5 h-5"></i> Base Req.</span>
                           <span class="text-white font-bold bg-zinc-900 px-4 py-1.5 rounded shadow-inner text-xl">8</span>
                       </div>
                       <div class="flex justify-between items-center font-mono text-base mb-6">
                           <span class="text-amber-300 font-bold flex items-center gap-2"><i data-lucide="life-buoy" class="w-5 h-5"></i> Reserves</span>
                           <span class="text-white font-bold bg-zinc-900 px-4 py-1.5 rounded shadow-inner text-xl">+ 2</span>
                       </div>
                       <div class="border-t border-indigo-500/50 pt-5 flex flex-col items-center justify-center bg-indigo-500/20 rounded-xl p-5 shadow-lg border border-indigo-400/30">
                           <span class="text-indigo-200 font-bold text-xs uppercase tracking-widest mb-1 text-center">Total Organization Need</span>
                           <span class="text-white font-black text-6xl drop-shadow-md">10</span>
                       </div>
                   </div>
               </div>
            `
        }
    };
    
    const data = modalData[state.activeModal];
    if (!data) return '';
    
    return `
    <div class="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 pb-24 md:pb-6">
        <div class="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm transition-opacity" onclick="window.closeModal()"></div>
        <div class="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-full">
            <div class="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/80 shrink-0">
                <h3 class="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase"><i data-lucide="info" class="w-6 h-6 text-indigo-400"></i> ${data.title}</h3>
                <button onclick="window.closeModal()" class="text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-700 rounded-lg p-2 transition-colors border border-zinc-700 outline-none shadow-sm"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="p-5 sm:p-6 overflow-y-auto flex-1 hide-scroll bg-zinc-900">
                ${data.htmlContent}
            </div>
            <div class="p-5 border-t border-zinc-800 bg-zinc-950/90 flex justify-end shrink-0">
                <button onclick="window.closeModal()" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 sm:py-3 rounded-xl font-black transition-colors text-sm shadow-md outline-none uppercase tracking-widest border border-indigo-500/50">Acknowledge</button>
            </div>
        </div>
    </div>
    `;
}