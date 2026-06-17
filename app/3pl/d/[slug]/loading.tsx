export default function Loading() {
  return (
    <div className="max-w-[1460px] mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
