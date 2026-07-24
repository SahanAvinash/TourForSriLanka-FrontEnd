import { Bus } from "lucide-react";

export default function VehicleTypeCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-xl bg-[#243b4a] text-left text-white transition hover:-translate-y-1"
    >
      <Bus className="absolute left-3 top-3 text-[#00d1a3]" size={16} />

      <img
        src={item.image}
        alt={item.title}
        className="h-[120px] w-full bg-white object-contain"
      />

      <div className="px-3 py-2.5">
        <h3 className="text-xs font-bold">{item.title}</h3>
        <p className="text-[11px] text-[#c9d2d7]">{item.text}</p>
      </div>
    </button>
  );
}