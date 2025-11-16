export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-xl text-gray-400 glitch-text neon-glow" data-text="Loading...">
          Loading...
        </p>
      </div>
    </div>
  );
}
