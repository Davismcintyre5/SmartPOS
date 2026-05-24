// Spinner
export const Spinner = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
};