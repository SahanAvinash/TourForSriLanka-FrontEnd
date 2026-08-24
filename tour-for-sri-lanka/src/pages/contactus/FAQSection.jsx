import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How can I book a tour?",
      answer:
        "Browse available tours, hotels, or guides on our website and follow the booking process. You'll receive confirmation once your booking is complete.",
    },
    {
      question: "Can I customize my travel package?",
      answer:
        "Yes! You can customize your itinerary based on your interests, destinations, and travel dates.",
    },
    {
      question: "Are your tour guides licensed?",
      answer:
        "Yes. All registered guides on our platform are verified before they can offer their services.",
    },
    {
      question: "Is airport pickup available?",
      answer:
        "Yes. Many vehicle owners and tour packages include airport pickup. You can check availability before booking.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "Cancellation policies depend on the hotel, guide, or tour provider. Please review the policy before confirming your booking.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="px-4 sm:px-6 mb-12 sm:mb-16">
      <div className="bg-[#253745] rounded-3xl p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Frequently Asked Questions
        </h2>

        <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
          Find answers to the questions we receive most often.
        </p>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#2F4156] rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left"
              >
                <span className="text-white font-semibold text-sm sm:text-base md:text-lg leading-6">
                  {faq.question}
                </span>

                {openIndex === index ? (
                  <FaChevronUp className="text-[#00C896] flex-shrink-0 text-sm sm:text-base" />
                ) : (
                  <FaChevronDown className="text-[#00C896] flex-shrink-0 text-sm sm:text-base" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-gray-300 text-sm sm:text-base leading-6 sm:leading-7">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}