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
       
       <header class="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shrink-0 pt-safe z-50 transition-colors shadow-sm">
           <div class="h-[60px] flex items-center justify-between px-4">
               <div class="flex items-center gap-2.5">
                   <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                       <i data-lucide="shield-check" class="w-5 h-5"></i>
                   </div>
                   <h1 class="text-[15px] font-black tracking-widest uppercase truncate text-zinc-900 dark:text-white mt-0.5">DutyPlanner</h1>
               </div>
               <div class="flex items-center gap-2.5">
                   <button onclick="window.toggleTheme()" class="relative p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-300 transition-all outline-none border border-zinc-200 dark:border-zinc-700 shadow-sm active:scale-95 group">
                       <i data-lucide="moon" class="w-4 h-4 hidden dark:block group-hover:text-indigo-400 transition-colors"></i>
                       <i data-lucide="sun" class="w-4 h-4 block dark:hidden group-hover:text-amber-500 transition-colors"></i>
                   </button>
                   <button onclick="window.updateApp()" class="relative p-2.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 transition-all outline-none border border-indigo-200 dark:border-indigo-500/30 shadow-sm active:scale-95 group">
                       <i data-lucide="refresh-cw" class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"></i>
                   </button>
               </div>
           </div>
       </header>

       <main class="flex-1 overflow-y-auto w-full hide-scroll relative bg-zinc-50 dark:bg-zinc-950 transition-colors">
           <div class="p-3 sm:p-4 w-full max-w-full min-h-full pb-8">
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
           <div class="p-6 md:p-8 w-full max-w-6xl mx-auto min-w-0 pb-16">
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
   <aside class="hidden lg:flex w-[280px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-xl shrink-0 h-full transition-colors relative">
       <div class="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
           <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
               <i data-lucide="shield-check" class="w-5 h-5"></i>
           </div>
           <div>
               <h1 class="text-base font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-widest mt-0.5">DutyPlanner</h1>
           </div>
       </div>
       <nav class="flex-1 p-5 space-y-2 overflow-y-auto hide-scroll">
           ${tabs.map(t => `
               <button onclick="window.switchTab('${t.id}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 outline-none group ${state.activeTab === t.id ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white border border-transparent'}">
                   <i data-lucide="${t.icon}" class="w-5 h-5 shrink-0 transition-colors ${state.activeTab === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}"></i>
                   ${t.name}
               </button>
           `).join('')}
       </nav>
       <div class="p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md">
           <button onclick="window.toggleTheme()" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow transition-all outline-none active:scale-95 group">
               <i data-lucide="moon" class="w-4 h-4 hidden dark:block group-hover:text-indigo-400 transition-colors"></i>
               <i data-lucide="sun" class="w-4 h-4 block dark:hidden group-hover:text-amber-500 transition-colors"></i>
               <span class="hidden dark:block">Switch to Light</span>
               <span class="block dark:hidden">Switch to Dark</span>
           </button>
           <button onclick="window.updateApp()" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all outline-none border border-indigo-500 active:scale-95 group">
               <i data-lucide="refresh-cw" class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"></i> Check for Updates
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
   <nav class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shrink-0 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] transition-colors">
       <div class="flex justify-around items-center h-[68px] px-1 pb-safe">
           ${tabs.map(t => `
               <button onclick="window.switchTab('${t.id}')" class="flex-1 flex flex-col items-center justify-center gap-1.5 transition-colors outline-none h-full ${state.activeTab === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-500'}">
                   <div class="relative flex items-center justify-center w-12 h-7 rounded-full ${state.activeTab === t.id ? 'bg-indigo-50 dark:bg-indigo-500/20 shadow-inner' : ''} transition-all duration-300">
                       <i data-lucide="${t.icon}" class="w-[22px] h-[22px] ${state.activeTab === t.id ? 'dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] scale-110' : 'scale-100'} transition-transform"></i>
                   </div>
                   <span class="text-[9px] font-black tracking-widest uppercase mt-0.5">${t.name}</span>
               </button>
           `).join('')}
       </div>
   </nav>
   `;
}

function Loader() {
   return `
   <div class="fixed inset-0 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-sm z-[300] flex flex-col items-center justify-center animate-in fade-in duration-200 w-full h-full transition-colors">
       <div class="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mb-4 shadow-lg"></div>
       <p class="text-indigo-600 dark:text-indigo-300 font-bold tracking-widest text-xs uppercase animate-pulse">Syncing Database...</p>
   </div>
   `;
}

function InfoModal(state) {
   if (!state.activeModal) return '';
   const m = {
       'onSite': { title: 'On-Site Demand', text: `Weekly hours to man active shifts.<br><span class="text-indigo-600 dark:text-indigo-400">E.g., 12hr × 7 days × 2 pax = 168 hrs/wk.</span>` },
       'standby': { title: 'Standby Buffers', text: `Buffer for call-ups.<br><span class="text-orange-600 dark:text-orange-400">Assume 2 activations/mo × 24 hrs = ~12 hrs/wk per headcount.</span>` },
       'baseReq': { title: 'Base Headcount', text: `Total operational hours ÷ single person's net capacity <span class="text-indigo-600 dark:text-indigo-400">(15 hrs/wk)</span>.` },
       'reserve': { title: 'Dedicated Reserves', text: `Calculated by shifts, not hours.<br><span class="text-amber-600 dark:text-amber-400">1 Reserve/shift × 7 days = 7 shifts/wk. ÷ 3.682 effective shifts/person = 2 Pax.</span>` },
       'totalReq': { title: 'Total Needed', text: `Base operations personnel + Dedicated reserve pool.` }
   };
   
   const data = m[state.activeModal] || m['onSite'];
   
   return `
   <div class="fixed inset-0 z-[250] flex items-center justify-center p-4 pb-20">
       <div class="absolute inset-0 bg-zinc-900/40 dark:bg-zinc-950/80 backdrop-blur-sm transition-opacity" onclick="window.closeModal()"></div>
       <div class="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 fade-in flex flex-col overflow-hidden">
           <div class="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
               <h3 class="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2.5 uppercase tracking-wide"><i data-lucide="info" class="w-5 h-5 text-indigo-500 dark:text-indigo-400"></i> ${data.title}</h3>
           </div>
           <div class="p-6 overflow-y-auto text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 font-medium">
               ${data.text}
           </div>
           <div class="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-end">
               <button onclick="window.closeModal()" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold tracking-wide outline-none shadow-md shadow-indigo-500/20 active:scale-95 transition-all">Acknowledge</button>
           </div>
       </div>
   </div>
   `;
}