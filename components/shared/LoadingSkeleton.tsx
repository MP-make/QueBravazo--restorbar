export default function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff5722] animate-spin" />
      </div>
    </div>
  );
}
