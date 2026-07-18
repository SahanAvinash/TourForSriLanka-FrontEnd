import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={category.path}
      className="group relative h-[280px] rounded-3xl overflow-hidden shadow-xl"
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition duration-300"></div>

      {/* Title */}
      <div className="absolute inset-0 flex items-end p-6">
        <h3 className="text-white text-3xl font-bold leading-tight group-hover:-translate-y-2 transition duration-300">
          {category.title}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;