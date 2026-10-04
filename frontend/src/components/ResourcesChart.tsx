import React from "react";
import { VM } from "../types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Cpu, HardDrive, Database, Activity, AlertTriangle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ResourcesChartProps {
  vms: VM[];
}

// Host System Physical Capacity Limits
const HOST_MAX_CORES = 32;
const HOST_MAX_RAM = 128; // GB
const HOST_MAX_DISK = 2000; // GB

export const ResourcesChart: React.FC<ResourcesChartProps> = ({ vms }) => {
  const { darkMode } = useTheme();

  // Calculate resources of active VMs
  const activeVMs = vms.filter((vm) => vm.status === "active");
  const totalCores = activeVMs.reduce((acc, vm) => acc + vm.cores, 0);
  const totalRam = activeVMs.reduce((acc, vm) => acc + vm.ram, 0);
  const totalDisk = activeVMs.reduce((acc, vm) => acc + vm.disk, 0);

  const corePercent = Math.round((totalCores / HOST_MAX_CORES) * 100);
  const ramPercent = Math.round((totalRam / HOST_MAX_RAM) * 100);
  const diskPercent = Math.round((totalDisk / HOST_MAX_DISK) * 100);

  const isOvercommitted = totalCores > HOST_MAX_CORES || totalRam > HOST_MAX_RAM || totalDisk > HOST_MAX_DISK;

  const chartData = {
    labels: [
      `CPU Cores (${totalCores}/${HOST_MAX_CORES})`,
      `RAM (${totalRam}/${HOST_MAX_RAM} GB)`,
      `Disk (${totalDisk}/${HOST_MAX_DISK} GB)`,
    ],
    datasets: [
      {
        data: [totalCores, totalRam, totalDisk / 10], // scaled disk for visual balance
        backgroundColor: [
          totalCores > HOST_MAX_CORES ? "rgba(239, 68, 68, 0.9)" : "rgba(99, 102, 241, 0.8)",
          totalRam > HOST_MAX_RAM ? "rgba(239, 68, 68, 0.9)" : "rgba(16, 185, 129, 0.8)",
          totalDisk > HOST_MAX_DISK ? "rgba(239, 68, 68, 0.9)" : "rgba(245, 158, 11, 0.8)",
        ],
        borderColor: [
          totalCores > HOST_MAX_CORES ? "#dc2626" : "rgba(99, 102, 241, 1)",
          totalRam > HOST_MAX_RAM ? "#dc2626" : "rgba(16, 185, 129, 1)",
          totalDisk > HOST_MAX_DISK ? "#dc2626" : "rgba(245, 158, 11, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: darkMode ? "#e5e7eb" : "#374151",
          font: { family: "Inter, sans-serif", weight: 500 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.dataIndex === 0) {
              return `CPU Cores: ${totalCores} allocated / ${HOST_MAX_CORES} max host (${corePercent}%)`;
            }
            if (context.dataIndex === 1) {
              return `RAM: ${totalRam} GB allocated / ${HOST_MAX_RAM} GB max host (${ramPercent}%)`;
            }
            if (context.dataIndex === 2) {
              return `Disk: ${totalDisk} GB allocated / ${HOST_MAX_DISK} GB max host (${diskPercent}%)`;
            }
            return "";
          },
        },
      },
    },
  };

  // Unique key to force chart redraw instantly when metrics change
  const chartKey = `${totalCores}-${totalRam}-${totalDisk}-${activeVMs.length}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Host System vs Active VMs Resources</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aggregate active VM footprint against host capacity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOvercommitted && (
            <div className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              Resource Overcommitment Warning!
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {activeVMs.length} Active VMs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Metric Cards with Host Capacity comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {/* Cores */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              totalCores > HOST_MAX_CORES
                ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                : "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${totalCores > HOST_MAX_CORES ? "bg-rose-500" : "bg-indigo-500"}`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">CPU Cores (Host Max: {HOST_MAX_CORES})</p>
                <p className={`text-xl font-bold ${totalCores > HOST_MAX_CORES ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-gray-100"}`}>
                  {totalCores} / {HOST_MAX_CORES}
                </p>
              </div>
            </div>
            <div
              className={`text-xs font-semibold px-2 py-1 rounded ${
                totalCores > HOST_MAX_CORES
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {corePercent}%
            </div>
          </div>

          {/* RAM */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              totalRam > HOST_MAX_RAM
                ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                : "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${totalRam > HOST_MAX_RAM ? "bg-rose-500" : "bg-emerald-500"}`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">RAM GB (Host Max: {HOST_MAX_RAM})</p>
                <p className={`text-xl font-bold ${totalRam > HOST_MAX_RAM ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-gray-100"}`}>
                  {totalRam} / {HOST_MAX_RAM} GB
                </p>
              </div>
            </div>
            <div
              className={`text-xs font-semibold px-2 py-1 rounded ${
                totalRam > HOST_MAX_RAM
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {ramPercent}%
            </div>
          </div>

          {/* Disk */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              totalDisk > HOST_MAX_DISK
                ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                : "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${totalDisk > HOST_MAX_DISK ? "bg-rose-500" : "bg-amber-500"}`}>
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Disk GB (Host Max: {HOST_MAX_DISK})</p>
                <p className={`text-xl font-bold ${totalDisk > HOST_MAX_DISK ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-gray-100"}`}>
                  {totalDisk} / {HOST_MAX_DISK} GB
                </p>
              </div>
            </div>
            <div
              className={`text-xs font-semibold px-2 py-1 rounded ${
                totalDisk > HOST_MAX_DISK
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  : "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
              }`}
            >
              {diskPercent}%
            </div>
          </div>
        </div>

        {/* Chart.js Doughnut with dynamic key for instant re-rendering */}
        <div className="lg:col-span-2 h-64 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Doughnut key={chartKey} data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
