// FactsSection
export const FactsSection = ({ facts = [] }) => {
  if (!facts.length) return null;
  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose SmartPOS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facts.slice(0, 10).map((fact, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">{i + 1}</span>
              <p className="text-white/90">{fact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};