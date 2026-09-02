import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import Overview from "./Overview";
import Sidebar from "./SlideBar";
import TopBar from "./TopBar";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Profile from "./Profile";
import MyProfile from "./MyProfile";

export default function GuideDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guide ge current status eka (isApproved) backend eken fetch karaganeema
  useEffect(() => {
    const fetchGuideProfile = async () => {
      try {
        // Token eka localStorage eke athi kiyala balannna (auth token eka aniwaryai)
        const token = localStorage.getItem("token") || localStorage.getItem("guideToken");
        
        const response = await fetch(`${API_BASE_URL}/api/guide/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setGuideData(data.guide || data);
        }
      } catch (error) {
        console.error("Error fetching guide profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideProfile();
  }, []);

  return (
    <div className="flex bg-gradient-to-r from-[#06141B] to-[#253745] min-h-screen relative">
      {/* Sidebar with mobile props */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Overlay for mobile when sidebar is open */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-8 space-y-6">
          
          {/* Approval Status Banner */}
          {!loading && (
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-lg transition-all ${
              guideData?.isApproved 
                ? "bg-[#00C896]/10 border-[#00C896]/30 text-[#00C896]" 
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {guideData?.isApproved ? "✅" : "⏳"}
                </span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {guideData?.isApproved ? "Account Status: Approved" : "Account Status: Pending Approval"}
                  </h4>
                  <p className="text-xs text-gray-300">
                    {guideData?.isApproved 
                      ? "Your account and profile are fully approved by the admin. You are active on the platform." 
                      : "Your profile or recent price changes are currently awaiting admin approval."}
                  </s:p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 border ${
                guideData?.isApproved 
                  ? "bg-[#00C896]/20 border-[#00C896]/40 text-[#00C896]" 
                  : "bg-yellow-400/20 border-yellow-400/40 text-yellow-300"
              }`}>
                {guideData?.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
          )}

          <Overview />
          <MyProfile />
          <Bookings />
          <Reviews />
          <Profile />
        </main>
      </div>
    </div>
  );
}