import React from "react";

export const ResourcesSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="w-28 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="space-y-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
};

export const VmCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
};
