// components/ui/Pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {pages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};