'use client';

import ClientWrapper from '../components/ClientWrapper';
import Sidebar from '../components/Sidebar';

export default function FavoritasPage() {
  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="w-full">
            <div className="max-w-5xl px-6 py-8 mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Favoritas</h1>
              </div>
              <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
                <p className="text-gray-300">Suas redações favoritas aparecerão aqui.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}


