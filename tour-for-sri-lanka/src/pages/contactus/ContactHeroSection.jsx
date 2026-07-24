import heroImage from "../../assets/contact_bg.jpg";

export default function ContactHeroSection() {
  return (
    <section className="px-6 pt-6">
      <div className="relative h-[430px] rounded-[30px] overflow-hidden">

        {/* Background Image */}
        <img
          src={heroImage}
          alt="Contact Hero"
          className="w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/35"></div>

        {/* Text */}
        <div className="absolute left-12 top-16 z-10">
          <h1 className="text-white text-6xl font-bold leading-tight">
            We are here to
            <br />
            help you
          </h1>
          <p className="text-gray-300 text-lg mt-5">
             Plan your perfect journey
          </p>
        </div>
      </div>
    </section>
  );
}