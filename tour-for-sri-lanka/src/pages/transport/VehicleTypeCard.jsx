import { useEffect, useRef, useState } from "react";
import { Bus } from "lucide-react";

export default function VehicleTypeCard({ item, onClick, index = 0 }) {
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      style={{ animationDelay: inView ? `${index * 0.1}s` : undefined }}
      className={`category-card-anim ${inView ? "in-view" : ""} relative overflow-hidden rounded-xl bg-[#243b4a] text-left text-white transition hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
    >
      <Bus className="absolute left-3 top-3 text-[#00d1a3]" size={16} />

      <img
        src={item.image}
        alt={item.title}
        className="h-[120px] w-full bg-white object-contain"
        onError={(e) => console.log('Image failed:', item.image)}
      />

      <div className="px-3 py-2.5">
        <h3 className="text-xs font-bold">{item.title}</h3>
        <p className="text-[11px] text-[#c9d2d7]">{item.text}</p>
      </div>
    </button>
  );
}