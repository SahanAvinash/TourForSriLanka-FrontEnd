import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const CategoryCard = ({ category, delay = 0 }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -150px 0px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={cardRef}
      to={`/destinations/${category._id}`}
      className={`group relative h-[280px] rounded-3xl overflow-hidden shadow-xl category-card-anim ${
        isVisible ? "in-view" : ""
      }`}
      style={{ animationDelay: isVisible ? `${delay}s` : "0s" }}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition duration-300" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <h3 className="text-[var(--color-text)] text-3xl font-bold leading-tight text-center group-hover:-translate-y-2 transition duration-300">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;