import { useState } from "react";

import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { SettingsDrawer } from "../components/SettingsDrawer";

export function MainLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="text-gray-800 font-sans antialiased h-screen flex overflow-hidden bg-[#f3f4f6]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#f3f4f6]">
        {/* Top Header */}
        <Header toggleSettings={() => setIsSettingsOpen(true)} />

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* System Settings Drawer */}
        <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </div>
  );
}
