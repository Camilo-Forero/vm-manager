import React, { useState, useEffect } from "react";
import { VM } from "../types";
import { X, Server, Cpu, HardDrive, Database, AlertCircle, AlertTriangle } from "lucide-react";

interface VmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vmData: { name: string; cores: number; ram: number; disk: number; os: string; status: "active" | "inactive" }) => Promise<void>;
  editingVm?: VM | null;
  allVMs: VM[];
}

const OS_OPTIONS = [
  "Ubuntu 22.04 LTS",
  "Ubuntu 24.04 LTS",
  "Debian 12",
  "CentOS Stream 9",
  "Alpine Linux",
  "Windows Server 2022",
  "RedHat Enterprise Linux 9",
];

const HOST_MAX_CORES = 32;
const HOST_MAX_RAM = 128; // GB
const HOST_MAX_DISK = 2000; // GB

export const VmModal: React.FC<VmModalProps> = ({ isOpen, onClose, onSave, editingVm, allVMs }) => {
  const [name, setName] = useState("");
  const [cores, setCores] = useState<number>(2);
  const [ram, setRam] = useState<number>(4);
  const [disk, setDisk] = useState<number>(50);
  const [os, setOs] = useState(OS_OPTIONS[0]);
  const [status, setStatus] = useState<"active" | "inactive">("inactive");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Calculate resources used by OTHER active VMs (excluding the one being edited)
  const otherActiveVMs = allVMs.filter((v) => {
    if (editingVm && Number(v.id) === Number(editingVm.id)) return false;
    return v.status === "active";
  });

  const usedCores = otherActiveVMs.reduce((acc, v) => acc + v.cores, 0);
  const usedRam = otherActiveVMs.reduce((acc, v) => acc + v.ram, 0);
  const usedDisk = otherActiveVMs.reduce((acc, v) => acc + v.disk, 0);

  const freeCores = Math.max(0, HOST_MAX_CORES - usedCores);
  const freeRam = Math.max(0, HOST_MAX_RAM - usedRam);
  const freeDisk = Math.max(0, HOST_MAX_DISK - usedDisk);

  const isCoresExceeded = status === "active" && cores > freeCores;
  const isRamExceeded = status === "active" && ram > freeRam;
  const isDiskExceeded = status === "active" && disk > freeDisk;

  useEffect(() => {
    if (editingVm) {
      setName(editingVm.name);
      setCores(editingVm.cores);
      setRam(editingVm.ram);
      setDisk(editingVm.disk);
      setOs(editingVm.os);
      setStatus(editingVm.status);
    } else {
      setName("");
      setCores(2);
      setRam(4);
      setDisk(50);
      setOs(OS_OPTIONS[0]);
      setStatus("inactive");
    }
    setErrors({});
  }, [editingVm, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = "VM name is required";
    } else if (name.length < 2) {
      errs.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      errs.name = "Only letters, numbers, hyphens, and underscores allowed";
    }

    if (cores <= 0 || cores > HOST_MAX_CORES) {
      errs.cores = `Cores must be between 1 and ${HOST_MAX_CORES}`;
    }
    if (ram <= 0 || ram > HOST_MAX_RAM) {
      errs.ram = `RAM must be between 0.5 and ${HOST_MAX_RAM} GB`;
    }
    if (disk < 5 || disk > HOST_MAX_DISK) {
      errs.disk = `Disk must be between 5 and ${HOST_MAX_DISK} GB`;
    }
    if (!os) {
      errs.os = "Operating system is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({ name: name.trim(), cores, ram, disk, os, status });
      onClose();
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {editingVm ? "Edit Virtual Machine" : "Create New Virtual Machine"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* VM Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">VM Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. prod-backend-01"
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* Cores & RAM Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                CPU Cores (Max free: {freeCores})
              </label>
              <div className="relative">
                <Cpu className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max={HOST_MAX_CORES}
                  value={cores}
                  onChange={(e) => setCores(parseInt(e.target.value) || 1)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
                    isCoresExceeded ? "border-rose-500 focus:ring-rose-500/20" : "border-gray-200 dark:border-gray-700 focus:border-brand-500"
                  }`}
                />
              </div>
              {isCoresExceeded && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Exceeds available free cores ({freeCores})
                </p>
              )}
              {errors.cores && <p className="mt-1 text-xs text-rose-600">{errors.cores}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                RAM (Max free: {freeRam} GB)
              </label>
              <div className="relative">
                <Database className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max={HOST_MAX_RAM}
                  value={ram}
                  onChange={(e) => setRam(parseFloat(e.target.value) || 0.5)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
                    isRamExceeded ? "border-rose-500 focus:ring-rose-500/20" : "border-gray-200 dark:border-gray-700 focus:border-brand-500"
                  }`}
                />
              </div>
              {isRamExceeded && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Exceeds available free RAM ({freeRam} GB)
                </p>
              )}
              {errors.ram && <p className="mt-1 text-xs text-rose-600">{errors.ram}</p>}
            </div>
          </div>

          {/* Disk & OS Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Disk (Max free: {freeDisk} GB)
              </label>
              <div className="relative">
                <HardDrive className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="5"
                  max={HOST_MAX_DISK}
                  value={disk}
                  onChange={(e) => setDisk(parseInt(e.target.value) || 5)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
                    isDiskExceeded ? "border-rose-500 focus:ring-rose-500/20" : "border-gray-200 dark:border-gray-700 focus:border-brand-500"
                  }`}
                />
              </div>
              {isDiskExceeded && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Exceeds available free disk ({freeDisk} GB)
                </p>
              )}
              {errors.disk && <p className="mt-1 text-xs text-rose-600">{errors.disk}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Operating System</label>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {OS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Switch */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Initial Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === "active"}
                  onChange={() => setStatus("active")}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active (Running)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={() => setStatus("inactive")}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inactive (Stopped)</span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingVm ? "Update VM" : "Create VM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
