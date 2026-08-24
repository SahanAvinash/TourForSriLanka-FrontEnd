import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let intersectionObserver;
    let settleTimer;

    const startObserving = () => {
      if (intersectionObserver) return;

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            intersectionObserver.disconnect();
            resizeObserver.disconnect();
          }
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      if (footerRef.current) intersectionObserver.observe(footerRef.current);
    };

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(startObserving, 300);
    });

    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(settleTimer);
      resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`bg-[var(--color-primary-2)] text-[var(--color-text)] text-[12px] footer-fade-anim ${
        isVisible ? "in-view" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-0">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6 lg:pr-6">

            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Explore
              </h3>

              <ul className="space-y-1 text-sm text-[var(--color-text)]">

                <li>
                  <Link
                    to="/"
                    onClick={() =>
                      window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "smooth",
                      })
                    }
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    to="/hotels"
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    Hotels
                  </Link>
                </li>

                <li>
                  <Link
                    to="/transport"
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    Transport
                  </Link>
                </li>

                <li>
                  <Link
                    to="/tours"
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    Tours
                  </Link>
                </li>

                <li>
                  <Link
                    to="/guides"
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    Guides
                  </Link>
                </li>

                <li>
                  <Link
                    to="/about"
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    About us
                  </Link>
                </li>

                <li>
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 hover:text-[var(--color-primary-green)] transition"
                  >
                    <FaChevronRight className="text-[10px]" />
                    Contact us
                  </Link>
                </li>

              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Contact Us
              </h3>

              <div className="space-y-2 text-sm text-[var(--color-text)]">

                <div className="flex gap-2">
                  <FaEnvelope className="text-[var(--color-primary-green)] mt-1 shrink-0" />
                  <div>
                    <p>info@toursforsrilanka.com</p>
                    <p>toursforsrilanka@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <FaPhoneAlt className="text-[var(--color-primary-green)] mt-1 shrink-0" />
                  <div>
                    <p>+94 70 387 1210</p>
                    <p>+94 71 937 5121</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <FaWhatsapp className="text-[var(--color-primary-green)] mt-4 shrink-0" />
                  <p>+94 77 847 7903</p>
                </div>

                <div className="flex gap-1.5">
                  <FaMapMarkerAlt className="text-[var(--color-primary-green)] mt-4 shrink-0" />
                  <div className="leading-4">
                    Tours For Sri Lanka Travel Agency
                    <br />
                    No. 608/1, Nabata Aluthgama,Dambulla Road,
                    <br />
                    Melsiripura,Sri Lanka - 60540
                    <br />
                    <br />
                    SLTDA Reg No : SLTDA/SQA/TA/2011
                    <br />
                    Civil Aviation License : A1478
                  </div>
                </div>

              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 sm:col-span-2 lg:col-span-1">

              <img
                src={tripadvisor}
                alt="Tripadvisor"
                className="w-[130px] max-w-full object-contain"
              />

              <div className="flex items-center gap-2">
                <img src={badge1} alt="" className="h-10 object-contain" />
                <img src={badge2} alt="" className="h-10 object-contain" />
                <img src={badge3} alt="" className="h-10 object-contain" />
              </div>

            </div>

          </div>

          <div className="flex flex-col items-center justify-center border-t-2 lg:border-t-0 lg:border-l-3 border-gray-500 pt-8 lg:pt-0 lg:pl-6 min-h-[200px]">

            <img
              src={logo}
              alt="Tours For Sri Lanka"
              className="w-[180px] sm:w-[220px] max-w-full object-contain mb-3"
            />

            <div className="flex gap-3 flex-wrap justify-center">
              <a href="#">
                <FaFacebook className="text-[26px] text-[#1877F2] hover:scale-110 duration-300" />
              </a>

              <a href="#">
                <FaInstagram className="text-[26px] text-pink-500 hover:scale-110 duration-300" />
              </a>

              <a href="#">
                <FaWhatsapp className="text-[26px] text-green-500 hover:scale-110 duration-300" />
              </a>

              <a href="#">
                <FaTiktok className="text-[24px] hover:scale-110 duration-300" />
              </a>

              <a href="#">
                <FaYoutube className="text-[26px] text-red-600 hover:scale-110 duration-300" />
              </a>
            </div>

            <p className="text-sm text-[var(--color-text)] text-center leading-5 mt-3">
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