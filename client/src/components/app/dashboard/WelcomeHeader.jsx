export default function WelcomeHeader({ name, storeName }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Welcome back, {name}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-1">
        Here's how {storeName} is doing today.
      </p>
    </div>
  );
}