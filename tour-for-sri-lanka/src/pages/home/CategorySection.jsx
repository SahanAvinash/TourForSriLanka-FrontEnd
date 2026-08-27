import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import CategoryCard from "./CategoryCard";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/category`)
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      <div className="text-center mb-14">
        <h2 className="text-5xl font-bold text-[var(--color-text)]">
          Explore Sri Lanka
        </h2>

        <p className="text-[var(--color-text)] mt-4 text-lg">
          Choose your favourite travel experience and discover amazing
          destinations.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-[var(--color-text)]">
          Loading categories...
        </p>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <CategoryCard
              key={category._id}
              category={category}
              delay={(index % 3) * 0.15}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-[var(--color-text)]">
          No categories available.
        </p>
      )}
    </section>
  );
};

export default CategorySection;