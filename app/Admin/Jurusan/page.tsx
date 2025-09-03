"use client";

import { Navbar } from "@/app/Admin/components/Navbar";
import { Sidebar } from "@/app/Admin/components/Sidebar";

export default function JurusanPage() {
  return (
    <div className="flex min-h-screens">
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-60">
        <div className="fixed top-0 right-0 left-64 z-10 bg-background border-b">
          <Navbar />
        </div>
        <main className="flex-1 p-6 lg:p-8 pt-20">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-start mb-6 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Kelola Jurusan
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Halaman untuk mengelola data jurusan
                </p>
              </div>
            </div>

            <div className="rounded-md border bg-white p-6">
              <p className="text-2xl font-bold">Hello world</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
