import { SetupDesktop, SetupMobile } from '../views/setup.js';
import { ManageDesktop, ManageMobile } from '../views/manage.js';
import { RosterDesktop, RosterMobile } from '../views/roster.js';
import { CalcDesktop, CalcMobile } from '../views/calculator.js';
import { SettingsDesktop, SettingsMobile } from '../views/settings.js';

export function AppTemplate(state) {
    if (state.isMobile) return MobileLayout(state);
    return DesktopLayout(state);
}

function MobileLayout(state) {
    return `
    <div class="flex flex-col h-[100dvh] w-full max-w-[100vw] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden">
        <!-- Native App-like Header -->
        <header class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 pt-safe z-50 transition-colors">
            <div class="h-16 flex items-center justify-between px-5">
                <div class="flex items-center gap-3">
                    <i data-lucide="shield-check" class="w-7 h-7 text-indigo-600 dark:text-indigo-400 shrink-0"></i>
                    <h1 class="text-xl font-bold tracking-wide uppercase truncate text-zinc-900 dark:text-white">DutyPlanner</h1>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.toggleTheme()" class="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white outline-none transition-colors">
                        <i data-lucide="moon" class="w-5 h-5 hidden dark:block"></i>
                        <i data-lucide="sun" class="w-5 h-5 block dark:hidden"></i>
                    </button>
                    <button onclick="window.updateApp()" class="p-2.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 outline-none transition-colors">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto w-full hide-scroll relative bg-zinc-50 dark:bg-zinc-950 transition-colors">
            <div class="p-4 sm:p-6 w-full max-w-full min-h-full pb-12">
                ${state.activeTab === 'setup' ? SetupMobile(state) : ''}
                ${state.activeTab === 'manage' ? ManageMobile(state) : ''}
                ${state.activeTab === 'roster' ? RosterMobile(state) : ''}
                ${state.activeTab === 'calc' ? CalcMobile(state) : ''}
                ${state.activeTab === 'settings' ? SettingsMobile(state) : ''}
            </div>
        </main>
        ${MobileNav(state)}
    </div>
    ${state.loading ? Loader() : ''}
    ${InfoModal(state)}
    `;
}

function DesktopLayout(state) {
    return `
    <div class="flex h-[100dvh] w-full max-w-[100vw] overflow-hidden relative bg-zinc-50 dark:bg-zinc-950 transition-colors">
        ${DesktopSidebar(state)}
        <main class="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden w-full relative">
            <div class="p-8 w-full max-w-6xl mx-auto min-w-0 pb-16">
                ${state.activeTab === 'setup' ? SetupDesktop(state) : ''}
                ${state.activeTab === 'manage' ? ManageDesktop(state) : ''}
                ${state.activeTab === 'roster' ? RosterDesktop(state) : ''}
                ${state.activeTab === 'calc' ? CalcDesktop(state) : ''}
                ${state.activeTab === 'settings' ? SettingsDesktop(state) : ''}
            </div>
        </main>
    </div>
    ${state.loading ? Loader() : ''}
    ${InfoModal(state)}
    `;
}

function DesktopSidebar(state) {
    const tabs = [
        { id: 'setup', name: 'Topology & Setup', icon: 'database' },
        { id: 'manage', name: 'Personnel', icon: 'users' },
        { id: 'roster', name: 'Roster Engine', icon: 'calendar-days' },
        { id: 'calc', name: 'Calculator', icon: 'calculator' },
        { id: 'settings', name: 'Advanced Settings', icon: 'settings' }
    ];
    return `
    <aside class="hidden lg:flex w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col z-10 shadow-2xl shrink-0 h-full transition-colors">
        <div class="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors">
                <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
                <h1 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight uppercase tracking-wider transition-colors">DutyPlanner</h1>
            </div>
        </div>
        <nav class="flex-1 p-5 space-y-2">
            ${tabs.map(t => `
                <button onclick="window.switchTab('${t.id}')" class="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 outline-none ${state.activeTab === t.id ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 shadow-sm dark:shadow-inner' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white border border-transparent'}">
                    <i data-lucide="${t.icon}" class="w-5 h-5 shrink-0"></i>
                    ${t.name}
                </button>
            `).join('')}
        </nav>
        <div class="p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-transparent">
            <button onclick="window.toggleTheme()" class="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none shadow-sm dark:shadow-none border border-zinc-200 dark:border-zinc-700">
                <i data-lucide="moon" class="w-5 h-5 hidden dark:block"></i>
                <i data-lucide="sun" class="w-5 h-5 block dark:hidden"></i>
                <span class="hidden dark:block">Light Mode</span>
                <span class="block dark:hidden">Dark Mode</span>
            </button>
            <button onclick="window.updateApp()" class="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 transition-colors shadow-sm outline-none">
                <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                Update App
            </button>
        </div>
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
    <nav class="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] transition-colors">
        <div class="flex justify-around items-center h-[72px] px-2 pb-safe">
            ${tabs.map(t => `
                <button onclick="window.switchTab('${t.id}')" class="flex-1 flex flex-col items-center justify-center gap-1.5 transition-colors outline-none h-full ${state.activeTab === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-500'}">
                    <div class="relative flex items-center justify-center w-14 h-8 rounded-full ${state.activeTab === t.id ? 'bg-indigo-50 dark:bg-indigo-500/20' : ''} transition-colors">
                        <i data-lucide="${t.icon}" class="w-[22px] h-[22px] ${state.activeTab === t.id ? 'dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}"></i>
                    </div>
                    <span class="text-[10px] font-bold tracking-wide uppercase mt-0.5">${t.name}</span>
                </button>
            `).join('')}
        </div>
    </nav>
    `;
}

function Loader() {
    return `
    <div class="fixed inset-0 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-sm z-[300] flex flex-col items-center justify-center animate-in fade-in duration-200 w-full h-full transition-colors">
        <div class="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mb-6 shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.6)]"></div>
        <p class="text-indigo-600 dark:text-indigo-300 font-bold tracking-widest text-sm uppercase animate-pulse">Syncing Database...</p>
    </div>
    `;
}

function InfoModal(state) {
    if (!state.activeModal) return '';
    const m = {
        'onSite': { title: 'On-Site Demand', htmlContent: `<p class="text-zinc-700 dark:text-zinc-300 text-lg">Total weekly hours required to man all active shifts. <br><br><span class="text-indigo-600 dark:text-indigo-300 font-bold">E.g., 12-hr shift × 7 days × 2 pax = 168 hrs/wk.</span></p>` },
        'standby': { title: 'Standby Buffers', htmlContent: `<p class="text-zinc-700 dark:text-zinc-300 text-lg">Statistical buffer for unexpected call-ups. <br><br><span class="text-orange-600 dark:text-orange-300 font-bold">Assume 2 activations/month × 24 hrs = 48 hrs/month = ~12 hrs/week per assigned headcount.</span></p>` },
        'baseReq': { title: 'Base Headcount', htmlContent: `<p class="text-zinc-700 dark:text-zinc-300 text-lg">Total operational hours divided by a single person's net duty capacity <span class="text-indigo-600 dark:text-indigo-300 font-bold">(15 hrs/person/wk)</span>.</p>` },
        'reserve': { title: 'Dedicated Reserves', htmlContent: `<p class="text-zinc-700 dark:text-zinc-300 text-lg">Reserves are calculated by shift blocks, not hours. <br><br><span class="text-amber-600 dark:text-amber-300 font-bold">1 Reserve/shift × 7 days = 7 shifts/wk. Divided by ~3.682 effective shifts a person can do per week = 2 Dedicated Reserves.</span></p>` },
        'totalReq': { title: 'Total Needed', htmlContent: `<p class="text-zinc-700 dark:text-zinc-300 text-lg">The final requirement: Base operations personnel + Dedicated reserve pool.</p>` }
    };
    
    const data = m[state.activeModal] || m['onSite'];
    
    return `
    <div class="fixed inset-0 z-[250] flex items-center justify-center p-4 lg:p-6 pb-24 lg:pb-6">
        <div class="absolute inset-0 bg-zinc-900/60 dark:bg-zinc-950/85 backdrop-blur-md transition-opacity" onclick="window.closeModal()"></div>
        <div class="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-md animate-in zoom-in-95 fade-in flex flex-col overflow-hidden transition-colors">
            <div class="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/80 transition-colors">
                <h3 class="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3 uppercase tracking-wide"><i data-lucide="info" class="w-7 h-7 text-indigo-500 dark:text-indigo-400"></i> ${data.title}</h3>
            </div>
            <div class="p-8 overflow-y-auto text-base text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 transition-colors">
                ${data.htmlContent}
            </div>
            <div class="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end transition-colors">
                <button onclick="window.closeModal()" class="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-lg shadow-lg border border-indigo-500/50 outline-none">Acknowledge</button>
            </div>
        </div>
    </div>
    `;
}