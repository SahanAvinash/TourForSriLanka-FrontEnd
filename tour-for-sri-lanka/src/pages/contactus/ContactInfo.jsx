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
    <section className="px-6 mt-8">
      <div className="bg-[#253745] rounded-3xl p-8 shadow-lg">

        <h2 className="text-3xl font-bold text-white mb-2">
          Get In Touch
        </h2>

        <p className="text-gray-400 mb-8">
          Reach out to us through any of the following channels.
        </p>

        <div className="grid md:grid-cols-2 gap-5">

          {contactItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#2F4156] rounded-2xl p-5 flex items-center gap-5 hover:scale-[1.02] transition"
            >
              <div className="w-14 h-14 rounded-full bg-[#00C896]/20 flex items-center justify-center text-[#00C896] text-2xl">
                {item.icon}
              </div>

              <div>
                <h3 className="text-white font-semibold">
                  {item.title}
                </h3>

                <p className="text-gray-200">
                  {item.info}
                </p>

                <p className="text-sm text-gray-400">
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