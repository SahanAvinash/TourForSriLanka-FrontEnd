import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

export default function ContactInfo() {
  const contactItems = [
    {
      icon: <FaPhoneAlt />,
      title: "Phone",
      info: "+94 77 784 7293",
      sub: "Mon - Sun : 8.00 AM - 8.00 PM",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      info: "info@toursforsrilanka.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Address",
      info: "No 608/1, Nabata Althugama",
      sub: "Dambulla Road, Melsiripura",
    },
    {
      icon: <FaClock />,
      title: "Business Hours",
      info: "Mon - Sun : 8.00 AM - 8.00 PM",
      sub: "Open all year round",
    },
  ];

  return (
    <section className="px-4 sm:px-6 mt-6 sm:mt-8">
      <div className="bg-[#253745] rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Get In Touch
        </h2>

        <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
          Reach out to us through any of the following channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {contactItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#2F4156] rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 hover:scale-[1.02] transition"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#00C896]/20 flex-shrink-0 flex items-center justify-center text-[#00C896] text-xl sm:text-2xl">
                {item.icon}
              </div>

              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm sm:text-base">
                  {item.title}
                </h3>

                <p className="text-gray-200 text-sm sm:text-base break-words">
                  {item.info}
                </p>

                <p className="text-xs sm:text-sm text-gray-400">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}