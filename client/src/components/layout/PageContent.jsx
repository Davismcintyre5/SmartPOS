export default function PageContent({ className = '', children }) {
  return (
    <div className={`px-4 md:px-6 py-6 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}