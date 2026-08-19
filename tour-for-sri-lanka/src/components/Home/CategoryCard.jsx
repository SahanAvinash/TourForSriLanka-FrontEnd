import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/destinations/${category._id}`}
      className="group relative h-[280px] rounded-3xl overflow-hidden shadow-xl"
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition duration-300"></div>

      {/* Title */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <h3 className="text-white text-3xl font-bold leading-tight text-center group-hover:-translate-y-2 transition duration-300">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;