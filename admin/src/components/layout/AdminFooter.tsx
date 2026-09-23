export function AdminFooter() {
  return (
    <footer className="h-10 flex items-center justify-between px-6 border-t border-slate-200 bg-white text-xs text-slate-500">
      <span>© {new Date().getFullYear()} SmartPOS</span>
      <span>v1.0.0</span>
    </footer>
  );
}