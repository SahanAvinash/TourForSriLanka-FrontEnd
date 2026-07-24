export default function OfficeLocation() {
  return (
    <section className="px-6 mt-8 mb-8">
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left Side */}
        <div className="bg-[#253745] rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-white mb-4">
            Visit Our Office
          </h2>

          <p className="text-gray-300 leading-8 mb-8">
            We'd love to welcome you! Whether you're planning your next
            adventure or need assistance with bookings, our team is ready
            to help.
          </p>

          <div className="space-y-5">

            <div>
              <h4 className="text-[#00C896] font-semibold text-lg">
                Office Address
              </h4>

              <p className="text-gray-300 mt-2 leading-7">
                No. 608/1,
                <br />
                Nabata Althugama,
                <br />
                Dambulla Road,
                <br />
                Melsiripura,
                <br />
                Sri Lanka.
              </p>
            </div>

            <div>
              <h4 className="text-[#00C896] font-semibold text-lg">
                Working Hours
              </h4>

              <p className="text-gray-300 mt-2">
                Monday – Sunday
                <br />
                8.00 AM – 8.00 PM
              </p>
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="rounded-3xl overflow-hidden shadow-lg h-[450px]">

          <iframe
            title="Tours For Sri Lanka Location"
            src="https://www.google.com/maps?q=Melsiripura,Sri+Lanka&output=embed"
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            className="border-0"
          />

        </div>

      </div>
    </section>
  );
}