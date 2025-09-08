'use client';

import { History, LineChart, Star } from 'lucide-react';
import React from 'react';

type NavItem = {
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: 'Histórico', icon: <History size={18} /> },
  { label: 'Evolução', icon: <LineChart size={18} /> },
  { label: 'Favoritos', icon: <Star size={18} /> },
];

export default function Sidebar(): React.ReactElement {
  const [selected, setSelected] = React.useState<string>('Histórico');
  return (
    <aside
      aria-label="Menu lateral"
      className="hidden md:flex md:flex-col md:w-80 md:shrink-0 border-r border-gray-700/40 bg-black/10 backdrop-blur-sm min-h-screen sticky top-0"
    >
      <div className="p-4 text-sm font-semibold text-white/80 tracking-tight">
        Reditto
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isSelected = selected === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelected(item.label)}
              className={
                `group w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors border ` +
                (isSelected
                  ? 'bg-purple-600/80 hover:bg-purple-600 border-purple-400/40 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80')
              }
            >
              <span className={isSelected ? 'text-white' : 'text-purple-300 group-hover:text-purple-200'}>{item.icon}</span>
              <span className={isSelected ? 'text-white' : undefined}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}


