import React from "react";
import { VM } from "../types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Cpu, HardDrive, Database, Activity } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ResourcesChartProps {
  vms: VM[];
}

export const ResourcesChart: React.FC<ResourcesChartProps> = ({ vms }) => {
  const { darkMode } = useTheme();

  // Calculate resources of active VMs
  const activeVMs = vms.filter((vm) => vm.status === "active");
  const totalCores = activeVMs.reduce((acc, vm) => acc + vm.cores, 0);
  const totalRam = activeVMs.reduce((acc, vm) => acc + vm.ram, 0);
  const totalDisk = activeVMs.reduce((acc, vm) => acc + vm.disk, 0);

  // Maximum capacity benchmarks for percentage representation
  const maxCores = 64;
  const maxRam = 256; // GB
  const maxDisk = 2000; // GB

  const chartData = {
    labels: ["CPU Cores", "RAM (GB)", "Disk (GB)"],
    datasets: [
      {
        data: [totalCores, totalRam, totalDisk / 10], // scaled disk for visual balance
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)", // Indigo
          "rgba(16, 185, 129, 0.8)", // Emerald
          "rgba(245, 158, 11, 0.8)", // Amber
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
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
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.dataIndex === 2) {
              label += `${totalDisk} GB`;
            } else {
              label += context.raw;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Active VMs Resource Allocation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time aggregate resource utilization</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {activeVMs.length} Active / {vms.length} Total VMs
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500 text-white">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Cores</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalCores}</p>
              </div>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">
              {Math.round((totalCores / maxCores) * 100)}% cap
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500 text-white">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total RAM</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalRam} GB</p>
              </div>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded">
              {Math.round((totalRam / maxRam) * 100)}% cap
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500 text-white">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Disk</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalDisk} GB</p>
              </div>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded">
              {Math.round((totalDisk / maxDisk) * 100)}% cap
            </div>
          </div>
        </div>

        {/* Chart.js Doughnut */}
        <div className="lg:col-span-2 h-64 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
