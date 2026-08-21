import { createContext, useContext, useState, useEffect } from "react";

const TripContext = createContext();
const STORAGE_KEY = "myTripDestinations";

export const TripProvider = ({ children }) => {
  const [tripDestinations, setTripDestinations] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tripDestinations));
  }, [tripDestinations]);

  const isInTrip = (id) => tripDestinations.some((d) => d._id === id);

  const addDestination = (dest) => {
    setTripDestinations((prev) =>
      prev.some((d) => d._id === dest._id) ? prev : [...prev, dest]
    );
  };

  const removeDestination = (id) => {
    setTripDestinations((prev) => prev.filter((d) => d._id !== id));
  };

  const toggleDestination = (dest) => {
    setTripDestinations((prev) =>
      prev.some((d) => d._id === dest._id)
        ? prev.filter((d) => d._id !== dest._id)
        : [...prev, dest]
    );
  };

  const clearTrip = () => setTripDestinations([]);

  return (
    <TripContext.Provider
      value={{
        tripDestinations,
        tripCount: tripDestinations.length,
        isInTrip,
        addDestination,
        removeDestination,
        toggleDestination,
        setTripDestinations, // reorder වගේ direct updates වලට
        clearTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);