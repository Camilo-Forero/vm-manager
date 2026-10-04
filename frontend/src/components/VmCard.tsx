import React, { useState } from "react";
import { VM, Role } from "../types";
import { Cpu, HardDrive, Database, Play, Square, Edit3, Trash2, Server, AlertTriangle } from "lucide-react";

interface VmCardProps {
  vm: VM;
  role: Role;
  onEdit: (vm: VM) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (vm: VM) => void;
  isRecentlyUpdated?: boolean;
}

const HOST_MAX_CORES = 32;
const HOST_MAX_RAM = 128; // GB
const HOST_MAX_DISK = 2000; // GB

export const VmCard: React.FC<VmCardProps> = ({ vm, role, onEdit, onDelete, onToggleStatus, isRecentlyUpdated }) => {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggleStatus(vm);
    setToggling(false);
  };

  const isActive = vm.status === "active";
  const isOversized = vm.cores > HOST_MAX_CORES || vm.ram > HOST_MAX_RAM || vm.disk > HOST_MAX_DISK;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md border transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden ${
        isRecentlyUpdated ? "ring-2 ring-brand-500 animate-flash" : "border-gray-100 dark:border-gray-700"
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="p-5 pb-4 border-b border-gray-100 dark:border-gray-700/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
                isActive ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600"
              }`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate max-w-[180px] sm:max-w-[220px]">
                {vm.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{vm.os}</p>
            </div>
          </div>

          {/* Status & Warning Badges */}
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
              {isActive ? "Active" : "Inactive"}
            </span>

            {isOversized && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Exceeds Host Max
              </span>
            )}
          </div>
        </div>

        {/* Card Body: Specs Grid */}
        <div className="p-5 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
            <Cpu className="w-4 h-4 text-brand-500 mb-1" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Cores</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{vm.cores} vCPU</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
            <Database className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">RAM</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{vm.ram} GB</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
            <HardDrive className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Disk</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{vm.disk} GB</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Actions (Admin Only - Completely Hidden for Client) */}
      {role === "admin" && (
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isActive
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            {isActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {toggling ? "Processing..." : isActive ? "Stop VM" : "Start VM"}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(vm)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Edit VM"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(vm.id)}
              className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete VM"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
