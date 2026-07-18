import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronRight,
} from "react-icons/fa";

import logo from "../assets/logo.png";
import tripadvisor from "../assets/tripadvisor.jpg";
import badge1 from "../assets/badge1.png";
import badge2 from "../assets/badge2.png";
import badge3 from "../assets/badge3.png";

export default function Footer() {
  return (
    <footer className="bg-[#253745] text-white text-[12px]">
      <div className="max-w-7xl mx-auto px-6 py-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">

          {/* LEFT */}
          <div className="flex justify-between items-start gap-6 pr-6">

            {/* Explore */}
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Explore
              </h3>

              <ul className="space-y-1 text-s text-gray-300">

                <li>
                  <Link 
                    to="/" 
                    onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth'})}
                    className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    Home
                  </Link>
                </li>

                <li>
                  <Link to="/hotels" className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    Hotels
                  </Link>
                </li>

                <li>
                  <Link to="/transport" className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    Transport
                  </Link>
                </li>

                <li>
                  <Link to="/tours" className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    Tours
                  </Link>
                </li>

                <li>
                  <Link to="/guides" className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    Guides
                  </Link>
                </li>

                <li>
                  <Link to="/about" className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    About us
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className="flex items-center gap-2 hover:text-[#00C896] transition">
                    <FaChevronRight className="text-[10px]" />
                    Contact us
                  </Link>
                </li>

              </ul>
            </div>

            {/* Contact */}
            <div>

              <h3 className="text-2xl font-semibold mb-2">
                Contact Us
              </h3>

              <div className="space-y-2 text-s text-gray-300">

                <div className="flex gap-2">
                  <FaEnvelope className="text-[#00C896] mt-1" />
                  <div>
                    <p>info@toursforsrilanka.com</p>
                    <p>toursforsrilanka@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <FaPhoneAlt className="text-[#00C896] mt-1" />
                  <div>
                    <p>+94 70 387 1210</p>
                    <p>+94 71 937 5121</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <FaWhatsapp className="text-[#00C896] mt-4" />
                  <p>+94 77 847 7903</p>
                </div>

                <div className="flex gap-1.5">
                  <FaMapMarkerAlt className="text-[#00C896] mt-4" />
                  <div className="leading-4">
                    Tours For Sri Lanka Travel Agency
                    <br />
                    No. 608/1, Nabata Aluthgama,Dambulla Road,
                    <br />
                    Melsiripura,Sri Lanka - 60540
                    <br />
                    <br/>
                    SLTDA Reg No : SLTDA/SQA/TA/2011
                    <br />
                    Civil Aviation License : A1478      
                  </div>
                </div>

              </div>

            </div>

            {/* Tripadvisor + Badges */}
            <div className="flex flex-col items-center gap-3 self-center">

              <img
                src={tripadvisor}
                alt="Tripadvisor"
                className="w-[130px] object-contain"
              />

              <div className="flex items-center gap-2">
                <img src={badge1} alt="" className="h-10 object-contain" />
                <img src={badge2} alt="" className="h-10 object-contain" />
                <img src={badge3} alt="" className="h-10 object-contain" />
              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-center justify-center border-l-3 border-gray-500 pl-6 min-h-[200px]">

            <img
              src={logo}
              alt="Tours For Sri Lanka"
              className="w-[220px] object-contain mb-3"
            />

            <div className="flex gap-3">
              <a href="#"><FaFacebook className="text-[26px] text-[#1877F2] hover:scale-110 duration-300" /></a>
              <a href="#"><FaInstagram className="text-[26px] text-pink-500 hover:scale-110 duration-300" /></a>
              <a href="#"><FaWhatsapp className="text-[26px] text-green-500 hover:scale-110 duration-300" /></a>
              <a href="#"><FaTiktok className="text-[24px] hover:scale-110 duration-300" /></a>
              <a href="#"><FaYoutube className="text-[26px] text-red-600 hover:scale-110 duration-300" /></a>
            </div>

            <p className="text-s text-gray-300 text-center leading-5 mt-3">
              © Copyright 2026 Tours For Sri Lanka
              <br />
              Designed by University of Ruhuna
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}