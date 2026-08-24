import { API_BASE_URL } from "../../config/api";
import { useEffect, useRef, useState } from "react";
import GuideCard from "./GuideCard";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function AnimatedGuideCard({ guide, index }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`category-card-anim ${
        inView ? "in-view" : ""
      } w-full min-w-0`}
      style={{
        animationDelay: inView ? `${index * 60}ms` : undefined,
      }}
    >
      <GuideCard guide={guide} />
    </div>
  );
}

const GuideList = ({ filters }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef(null);
  const isFirstRender = useRef(true);

  const isSearching =
    filters &&
    (filters.district || filters.language || filters.skill);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();

    if (filters?.district) {
      params.append("district", filters.district);
    }

    if (filters?.language) {
      params.append("language", filters.language);
    }

    if (filters?.skill) {
      params.append("skill", filters.skill);
    }

    const url = `${API_BASE_URL}/api/guide/?${params.toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch guides");
        }

        return res.json();
      })
      .then((data) => {
        setGuides(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.log(error);
        setGuides([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isSearching && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [filters, isSearching]);

  return (
    <section
      ref={sectionRef}
      className="px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 bg-[#11212D] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {isSearching ? "Search Result" : "Meet Our Guides"}
          </h2>

          <p className="text-gray-400 text-sm sm:text-base mt-2 leading-relaxed">
            {isSearching
              ? "Guides matching your search"
              : "Explore experienced local guides across Sri Lanka"}
          </p>
        </div>

        {/* Guide Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-10">
              <p className="text-gray-400 text-sm sm:text-base">
                Loading guides...
              </p>
            </div>
          ) : guides.length === 0 ? (
            <div className="col-span-full flex justify-center py-10 px-4">
              <p className="text-gray-400 text-sm sm:text-base text-center">
                {isSearching
                  ? "No guides match your search"
                  : "No guides found"}
              </p>
            </div>
          ) : (
            guides.map((guide, index) => (
              <AnimatedGuideCard
                key={guide._id}
                guide={guide}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default GuideList;