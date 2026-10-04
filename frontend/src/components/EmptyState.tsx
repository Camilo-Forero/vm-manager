import React from "react";
import { Server, Plus } from "lucide-react";
import { Role } from "../types";

interface EmptyStateProps {
  role: Role;
  onCreateClick?: () => void;
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ role, onCreateClick, searchQuery }) => {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Server className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        {searchQuery ? "No matching virtual machines found" : "No virtual machines deployed"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
        {searchQuery
          ? `We couldn't find any VMs matching "${searchQuery}". Try adjusting your search or filters.`
          : role === "admin"
          ? "Get started by creating your first virtual machine instance on the cluster."
          : "There are currently no virtual machines available on the platform."}
      </p>
      {role === "admin" && !searchQuery && onCreateClick && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Deploy First VM
        </button>
      )}
    </div>
  );
};
