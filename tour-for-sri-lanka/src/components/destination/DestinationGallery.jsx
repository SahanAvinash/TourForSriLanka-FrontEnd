const DestinationGallery = ({ destination }) => {
  return (
    <section className="max-w-7xl mx-auto px-8 pt-10">

      <img
        src={destination.image}
        alt={destination.name}
        className="w-full h-[500px] object-cover rounded-3xl"
      />

    </section>
  );
};

export default DestinationGallery;