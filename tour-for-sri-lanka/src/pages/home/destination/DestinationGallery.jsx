import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DestinationGallery = ({ destination }) => {
  const [activeImage, setActiveImage] = useState(0);

  let imagesArray = destination.images?.length > 0
    ? destination.images
    : destination.image
    ? [destination.image]
    : [];

  if (imagesArray.length === 0) imagesArray = ["/destination_placeholder.jpg"];

  useEffect(() => {
    if (imagesArray.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev === imagesArray.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [imagesArray.length]);

  useEffect(() => {
    setActiveImage(0);
  }, [destination._id]);

  return (
    <section className="max-w-7xl mx-auto px-8 pt-10">
      <div className="relative h-[500px]">
        <div className="relative h-full rounded-3xl overflow-hidden group">
          {imagesArray.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={destination.name}
              className={`absolute inset-0 w-full h-full object-cover object-[center_70%] transition-opacity duration-1000 ease-in-out ${
                i === activeImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {imagesArray.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveImage((prev) =>
                    prev === 0 ? imagesArray.length - 1 : prev - 1
                  )
                }
                className="absolute left-[16px] top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 hover:text-[var(--color-primary-green)]/80 text-white h-[40px] w-[40px] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() =>
                  setActiveImage((prev) =>
                    prev === imagesArray.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-[16px] top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 hover:text-[var(--color-primary-green)]/80 text-white w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <FaChevronRight />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DestinationGallery;