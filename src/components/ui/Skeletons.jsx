import React from 'react';

export const SkeletonMaterial = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 animate-pulse">
    <div className="bg-slate-200 dark:bg-slate-800 w-16 h-16 rounded-2xl shrink-0"></div>
    <div className="flex-1 w-full">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-3"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-1"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
    </div>
  </div>
);

export const SkeletonEvaluacion = () => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-pulse h-48">
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-1"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
    <div className="mt-auto h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
  </div>
);

export const SkeletonFamilia = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-pulse h-56">
    <div className="flex justify-between mb-4">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
    </div>
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-4"></div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
    </div>
  </div>
);

export const SkeletonGaleria = () => (
  <div className="rounded-2xl aspect-square border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
);

export const SkeletonCalendario = () => (
  <div className="animate-pulse">
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
      <div className="h-[400px] w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
    </div>
  </div>
);

export const SkeletonTrayectoria = () => (
  <div className="relative pl-8 sm:pl-32 py-6 border-l-2 border-slate-200 dark:border-slate-800 animate-pulse">
    <div className="absolute left-[-11px] sm:left-[-11px] top-8 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-950"></div>
    <div className="hidden sm:block absolute left-4 top-8 w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
    </div>
  </div>
);
