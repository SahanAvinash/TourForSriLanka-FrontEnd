import aboutBg from "../../assets/about_bg.jpg";

import {
  FaShieldAlt,
  FaGlobeAsia,
  FaHeadset,
  FaMoneyBillWave,
  FaUsers,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaBullseye,
  FaEye,
} from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function AboutUsPage() {
  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Qualified Drivers and Staff",
      desc: "Our large fleet of vehicles includes luxury and mini coaches, vans, cars, and even limousines that operate 24 hours. Our drivers are friendly and well-trained. Furthermore, our expert local tour guides have extensive knowledge of an array of destinations.",
    },
    {
      icon: <FaGlobeAsia />,
      title: "No Hidden Charges",
      desc: "Not only is our charge affordable but also transparent. We keep our pricing clear and simple. The absence of hidden charges has helped develop good trust with our clients.Transparent pricing with no unexpected costs.",
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Support",
      desc: "Our customer service is time-bound. Travel agents are always ready to serve you at any time. Reach us at any time of the day for effective solutions to your travel problems.",
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Value for Money",
      desc: "We don believe in a job half done. It not in our policies. We dig into the very last detail to make sure that our service is perfect. Travelling with Tours for Sri lanka will create an experience which you will treasure, a service with unmatched quality and a journey worth your money.",
    },
    {
      icon: <FaUsers />,
      title: "Instant Response",
      desc: "At Tours for Sri lanka we value time as much as you do. We dislike disappointing you with delays and forgotten inquiries which is why we strive to offer a service with instant response to your needs. From day one till your travel is complete and your feedback is heard we are in touch with you making sure everything you wanted your trip to be is just in their right places.",
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Flexibility",
      desc: "Our success story lies in offering our clients an itinerary that they find satisfaction in. This makes us open to be flexible and independent to listen to our customers requirements and plan accordingly. We see as to how we can use our expertise to tailor make something that you entrust that we can do.",
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Language and Culture",
      desc: "At Tours for Sri lanka Communicating is made simple since personalized service to our clients are offered by multilingual customer service agents with language proficiency in English, Japanese, Chinese, German, Russian, Arabic, French and Spanish. This ensures that with no doubt what is asked for is delivered.",
    },
    {
      icon: <FaCheckCircle />,
      title: "100% Customer Satisfaction",
      desc: "When we say. It a tailor made itinerary we are not bluffing.But, we really do sit down and make an effort to make sure that a flawless trip that we are creating just for you. Regardless of it being a family tour or a honeymoon package we are not hesitant to take that extra mile in trying to reach perfectionism so that you would never think twice to come again to us.",
    },
    {
      icon: <FaCheckCircle />,
      title: "Guaranteed Satisfaction",
      desc: "We are always there to help you with your travel plans but we do understand that some flaws can get in its way. Tha why we work till the very end making sure everything goes smooth. Your satisfaction is unconditional to us. Starting From the customer service we offer to every little detail about your vacation we guarantee that your feedback would be nothing but positive remarks about us.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#02131E] via-[#0D2434] to-[#213847] pt-20">
      
        <Navbar/>
      {/* Hero */}
      <section className="px-5 md:px-10 pt-6">
        <div
          className="h-[430px] rounded-[30px] bg-cover bg-center relative overflow-hidden "
          style={{
            backgroundImage: `url(${aboutBg})`,
          }}
        >
          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute left-8 top-16 text-white max-w-2xl">
            <h1 className="text-5xl font-bold leading-tight">
              Discover the Beauty of Sri Lanka
              <br />
              With Trusted Local Experts
            </h1>

            <p className="mt-4 text-lg text-gray-200">
              We are a Sri Lankan based tourism platform dedicated to helping
              travelers explore the island with comfort, safety and unforgettable
              experiences.
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-5 md:px-10 py-10 text-white">
        <h2 className="text-3xl font-bold mb-5">About Us</h2>

        <div className="bg-[#11212D]/80 p-6 rounded-3xl">
          <p className="leading-8 text-gray-300 text-justify">
            We are a tourism-focused organization based in Sri Lanka's tourism industry that provides information and services to the world about tourists visiting our island and the various places they visit and experience.
            Our tour guides possess a high level of training and are licensed by the Sri Lanka Tourism Board. You can interact with them in different languages, and you will have the opportunity to connect with a guide who can speak your native language. The transportation we provide ranges from cars to large trains, all of which are air-conditioned, very comfortable and safe, and driven by courteous drivers.
            Our tour packages have many Sri Lankan specialties. It includes Sigiri Rock Fort, Cultural Triangle, Nuwara Eliya Tea Estates, Wildlife Safaris in National Parks, Beach Relaxation, Galle Fort Exploration, Culinary, Ayurvedic, and Wellness Retreats, Adventure Activities, and Responsible Travel. We have created a variety of travel packages specialized to meet the needs of individuals, families, or groups. Traveling to Sri Lanka will give you an unforgettable experience with lots of fun, excitement, and memories to last a lifetime. Whether you're looking for adventure, relaxation, or cultural immersion, Sri Lanka has something to offer every traveler. With its warm hospitality and diverse attractions, a visit to Sri Lanka is sure to be an unforgettable experience.
            
          </p>

          <p className="leading-8 text-gray-300 mt-4">
            We invite you to browse our website to discover and book the best travel packages that Sri Lanka has to offer. A tour package according to your requirements, as well as our tour package, can be customized according to your taste. Join us now and get one step closer to your dream Sri Lanka tour. Our aim is to provide a unique, memorable travel experience that reflects the true desires and interests of the traveler and to perform this service with professionalism, creativity, and knowledge. We try our best to show the real Sri Lanka to the customers who trust us.

          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-5 md:px-10">
        <div className="bg-[#253745]/80 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-3 mb-5">
            <FaBullseye className="text-[#00C896] text-2xl" />
            <h3 className="text-2xl font-bold">Mission</h3>
          </div>

          <ul className="space-y-3 text-gray-300">
            <li>✓ Deliver safe and memorable travel experiences.</li>
            <li>✓ Support local communities and tourism businesses.</li>
            <li>✓ Provide trusted information and services.</li>
            <li>✓ Promote Sri Lanka as a world-class destination.</li>
          </ul>
        </div>
      </section>

      {/* Vision */}
      <section className="px-5 md:px-10 mt-6">
        <div className="bg-[#253745]/80 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-3 mb-5">
            <FaEye className="text-[#00C896] text-2xl" />
            <h3 className="text-2xl font-bold">Vision</h3>
          </div>

          <ul className="space-y-3 text-gray-300">
            <li>✓ Become Sri Lanka's most trusted tourism platform.</li>
            <li>✓ Deliver exceptional travel experiences worldwide.</li>
            <li>✓ Empower local guides and tourism providers.</li>
            <li>✓ Promote sustainable tourism practices.</li>
          </ul>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-5 py-12">
        <h2 className="text-center text-white text-4xl font-bold mb-10">
          Why Travelers Choose Us
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-[#243847]/80 rounded-3xl p-6 text-center hover:scale-105 duration-300"
            >
              <div className="text-[#00C896] text-3xl flex justify-center mb-4">
                {item.icon}
              </div>

              <h3 className="text-white font-bold mb-3">
                {item.title}
              </h3>

              <p className="text-gray-300 text-sm text-justify">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer/>
    </div>
  );
}