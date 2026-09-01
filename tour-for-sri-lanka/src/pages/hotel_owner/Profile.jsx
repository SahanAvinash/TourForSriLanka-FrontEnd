return (
  <section
    id="profile"
    className="w-full flex flex-col justify-start items-start px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 pb-16 overflow-x-hidden"
  >
    <div className="w-full max-w-[1100px]">
      
      <h2 className="text-2xl font-semibold text-white mb-6">
        Hotel Profile
      </h2>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Hotel Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <DetailRow
            label="Owner Name"
            value={`${hotel?.firstName || ""} ${hotel?.lastName || ""}`}
          />
          <DetailRow label="Email" value={hotel?.email} />
          <DetailRow label="NIC / Passport" value={hotel?.nicOrPassport} />
          <DetailRow label="Mobile" value={hotel?.ownerMobile} />
          <DetailRow label="Hotel Name" value={hotel?.name} />
          <DetailRow label="Hotel Type" value={hotel?.hotelType} />
          <DetailRow label="Phone 1" value={hotel?.phone1} />
          <DetailRow label="Phone 2" value={hotel?.phone2} />
          <DetailRow label="District" value={hotel?.district} />
          <DetailRow label="Address" value={hotel?.address} />
          <DetailRow label="BR Number" value={hotel?.BRnumber} />
          <DetailRow label="License Number" value={hotel?.licenseNumber} />
          <DetailRow
            label="Approval Status"
            value={hotel?.isApproved ? "Approved" : "Pending Approval"}
          />
        </div>

        {hotel?.facilities && (
          <div className="mt-5">
            <p className="text-gray-400 mb-2">Facilities</p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(hotel.facilities)
                .filter(([, value]) => value)
                .map(([key]) => (
                  <span
                    key={key}
                    className="bg-[#1B2B34] text-[#00C896] text-xs px-3 py-1 rounded-full capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                ))}

              {hotel.otherFacility?.map((item, index) => (
                <span
                  key={`other-${index}`}
                  className="bg-[#1B2B34] text-[#00C896] text-xs px-3 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-gray-500 text-xs mt-4">
          These details can't be edited here. Contact support if any of this
          information needs to change.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-[#00C896]/10 border border-[#00C896] text-[#00C896] rounded-xl px-4 py-3 mb-5">
          {message}
        </div>
      )}

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Hotel Status
          </h3>

          <button
            onClick={() =>
              setStatus((prev) =>
                prev === "active" ? "disabled" : "active"
              )
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              status === "active"
                ? "bg-[#00C896] text-white"
                : "bg-[#4A5C6A] text-gray-200"
            }`}
          >
            {status === "active" ? "Active" : "Disabled"}
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          {status === "active"
            ? "Your hotel is visible to travelers."
            : "Your hotel is hidden from travelers. Enable it to receive bookings again."}
        </p>
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">
          Description
        </h3>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896] resize-none"
          placeholder="Tell travelers about your hotel..."
        />
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">
          Images ({images.length}/5)
        </h3>

        <div className="flex flex-wrap gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative w-28 h-28">
              <img
                src={img}
                alt={`hotel-${index}`}
                className="w-full h-full object-cover rounded-xl"
              />

              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                <FaTimes />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <label className="w-28 h-28 rounded-xl border-2 border-dashed border-[#4A5C6A] flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[#00C896] hover:text-[#00C896] transition-all">
              <FaCamera className="mb-1" />

              <span className="text-xs">
                {uploading ? "Uploading..." : "Add"}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="bg-[#11212D] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">
          Change Password
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#00C896]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-[#1B2B34] text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00C896]"
          />
        </div>

        <p className="text-gray-500 text-xs mt-2">
          Leave blank if you don't want to change your password.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#00C896] text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </section>
);