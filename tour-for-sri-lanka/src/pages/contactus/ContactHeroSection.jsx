import heroImage from "../../assets/contact_bg.jpg";

export default function ContactHeroSection() {
  return (
    <section className="px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="relative h-[380px] sm:h-[430px] rounded-[24px] sm:rounded-[30px] overflow-hidden">
        {/* Background Image */}
        <img
          src={heroImage}
          alt="Contact Hero"
          className="w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 md:h-40 bg-gradient-to-t from-[#11212D] via-[#11212D]/60 to-transparent" />

        {/* Text */}
        <div className="absolute left-5 right-5 sm:left-8 sm:right-8 md:left-12 top-12 sm:top-16 z-10">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            We are here to
            <br />
            help you
          </h1>

          <p className="text-gray-300 text-base sm:text-lg mt-4 sm:mt-5">
            Plan your perfect journey
          </p>
        </div>
      </div>
    </section>
  );
}