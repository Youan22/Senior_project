import type { ReactNode } from "react";
import AppHeader from "./AppHeader";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
