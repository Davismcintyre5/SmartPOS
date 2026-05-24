// components/ui/EmptyState.jsx
import { PackageOpen } from "lucide-react";

export const EmptyState = ({ icon: Icon = PackageOpen, title = "No data found", description = "", action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};