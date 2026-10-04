import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { VM } from "../types";
import { fetchVMs, createVMAPI, updateVMAPI, deleteVMAPI } from "../services/api";
import { Navbar } from "../components/Navbar";
import { ResourcesChart } from "../components/ResourcesChart";
import { VmCard } from "../components/VmCard";
import { VmModal } from "../components/VmModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ResourcesSkeleton, VmCardSkeleton } from "../components/Skeletons";
import { EmptyState } from "../components/EmptyState";
import { Plus, Search, Filter, Server } from "lucide-react";
import { io, Socket } from "socket.io-client";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [osFilter, setOsFilter] = useState<string>("all");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVm, setEditingVm] = useState<VM | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Recent update highlight animation tracking
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<number | null>(null);

  // Load VMs
  const loadVMs = async () => {
    try {
      const data = await fetchVMs();
      setVms(data.vms);
    } catch (err: any) {
      showToast(err.message || "Failed to load VMs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVMs();

    // Socket.io connection for real-time updates
    const socket: Socket = io({
      path: "/socket.io",
      withCredentials: true,
    });

    socket.on("vm:created", (newVm: VM) => {
      setVms((prev) => {
        if (prev.some((v) => Number(v.id) === Number(newVm.id))) return prev;
        return [newVm, ...prev];
      });
      setRecentlyUpdatedId(newVm.id);
      setTimeout(() => setRecentlyUpdatedId(null), 2000);
      showToast(`VM "${newVm.name}" was created in real-time`, "info");
    });

    socket.on("vm:updated", (updatedVm: VM) => {
      setVms((prev) => prev.map((v) => (Number(v.id) === Number(updatedVm.id) ? updatedVm : v)));
      setRecentlyUpdatedId(updatedVm.id);
      setTimeout(() => setRecentlyUpdatedId(null), 2000);
      showToast(`VM "${updatedVm.name}" was updated`, "info");
    });

    socket.on("vm:deleted", ({ id }: { id: number }) => {
      setVms((prev) => prev.filter((v) => Number(v.id) !== Number(id)));
      showToast(`VM was deleted`, "info");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // CRUD Operations with Optimistic UI
  const handleSaveVM = async (vmData: { name: string; cores: number; ram: number; disk: number; os: string; status: "active" | "inactive" }) => {
    if (editingVm && editingVm.id) {
      const editingId = Number(editingVm.id);
      const previousVms = [...vms];
      const existingVmRecord = vms.find((v) => Number(v.id) === editingId);

      const optimisticVm: VM = {
        id: editingId,
        ...vmData,
        createdAt: existingVmRecord ? existingVmRecord.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update using strict numerical ID comparison
      setVms((prev) => prev.map((v) => (Number(v.id) === editingId ? optimisticVm : v)));

      try {
        const res = await updateVMAPI(editingId, vmData);
        if (res && res.vm) {
          setVms((prev) => prev.map((v) => (Number(v.id) === editingId ? res.vm : v)));
        }
        showToast(`VM "${vmData.name}" updated successfully`, "success");
      } catch (err: any) {
        setVms(previousVms); // Rollback on error
        showToast(err.message || "Failed to update VM", "error");
        throw err;
      }
    } else {
      try {
        const res = await createVMAPI(vmData);
        if (res && res.vm) {
          setVms((prev) => {
            if (prev.some((v) => Number(v.id) === Number(res.vm.id))) return prev;
            return [res.vm, ...prev];
          });
        }
        showToast(`VM "${vmData.name}" created successfully`, "success");
      } catch (err: any) {
        showToast(err.message || "Failed to create VM", "error");
        throw err;
      }
    }
  };

  const handleToggleStatus = async (vm: VM) => {
    const targetId = Number(vm.id);
    const newStatus = vm.status === "active" ? "inactive" : "active";
    const previousVms = [...vms];

    // Optimistic UI update with strict ID check
    setVms((prev) => prev.map((v) => (Number(v.id) === targetId ? { ...v, status: newStatus } : v)));

    try {
      const res = await updateVMAPI(targetId, { status: newStatus });
      if (res && res.vm) {
        setVms((prev) => prev.map((v) => (Number(v.id) === targetId ? res.vm : v)));
      }
      showToast(`VM "${vm.name}" is now ${newStatus}`, "success");
    } catch (err: any) {
      setVms(previousVms); // Rollback
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleDeleteVM = async () => {
    if (deleteId === null) return;
    const targetId = Number(deleteId);
    const previousVms = [...vms];

    // Optimistic removal with strict ID check
    setVms((prev) => prev.filter((v) => Number(v.id) !== targetId));

    try {
      await deleteVMAPI(targetId);
      showToast("VM deleted successfully", "success");
    } catch (err: any) {
      setVms(previousVms); // Rollback
      showToast(err.message || "Failed to delete VM", "error");
    }
  };

  // Filter VMs
  const filteredVMs = vms.filter((vm) => {
    const matchesSearch = vm.name.toLowerCase().includes(searchQuery.toLowerCase()) || vm.os.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || vm.status === statusFilter;
    const matchesOs = osFilter === "all" || vm.os === osFilter;
    return matchesSearch && matchesStatus && matchesOs;
  });

  const uniqueOsList = Array.from(new Set(vms.map((v) => v.os)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Resources Allocation Panel (Chart.js Component) */}
        {loading ? <ResourcesSkeleton /> : <ResourcesChart vms={vms} />}

        {/* VMs Section */}
        <div className="space-y-6">
          {/* Section Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Virtual Machines</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage compute instances across the cluster</p>
              </div>
            </div>

            {/* Admin-only Create Button - Completely Hidden for Client */}
            {user?.role === "admin" && (
              <button
                onClick={() => {
                  setEditingVm(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Deploy New VM
              </button>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search VMs by name or OS..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <select
                value={osFilter}
                onChange={(e) => setOsFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
              >
                <option value="all">All OS</option>
                {uniqueOsList.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VMs Flex / Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <VmCardSkeleton />
              <VmCardSkeleton />
              <VmCardSkeleton />
            </div>
          ) : filteredVMs.length === 0 ? (
            <EmptyState
              role={user?.role || "client"}
              searchQuery={searchQuery}
              onCreateClick={() => {
                setEditingVm(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVMs.map((vm) => (
                <VmCard
                  key={vm.id}
                  vm={vm}
                  role={user?.role || "client"}
                  onEdit={(v) => {
                    setEditingVm(v);
                    setIsModalOpen(true);
                  }}
                  onDelete={(id) => setDeleteId(id)}
                  onToggleStatus={handleToggleStatus}
                  isRecentlyUpdated={recentlyUpdatedId === vm.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <VmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVm(null);
        }}
        onSave={handleSaveVM}
        editingVm={editingVm}
        allVMs={vms}
      />

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteVM}
        vmName={vms.find((v) => Number(v.id) === Number(deleteId))?.name}
      />
    </div>
  );
};
