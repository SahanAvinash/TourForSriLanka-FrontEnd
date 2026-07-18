import categories from "../../data/categories";
import CategoryCard from "./CategoryCard";

const CategorySection = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 py-16">

      {/* Heading */}
      <div className="text-center mb-14">
        <h2 className="text-5xl font-bold text-white">
          Explore Sri Lanka
        </h2>

        <p className="text-gray-400 mt-4 text-lg">
          Choose your favourite travel experience and discover amazing destinations.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}

      </div>

    </section>
  );
};

export default CategorySection;