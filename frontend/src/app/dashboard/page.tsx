"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Icon } from "@iconify/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [harvests, setHarvests] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New Harvest Form
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [cropName, setCropName] = useState("");
  const [estimatedKg, setEstimatedKg] = useState("");
  const [status, setStatus] = useState("growing");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "farmer") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [harvestsRes, demandsRes] = await Promise.all([
        apiFetch<{ harvests: any[] }>('/harvests'),
        apiFetch<{ demands: any[] }>('/demands')
      ]);
      setHarvests(harvestsRes.harvests);
      setDemands(demandsRes.demands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePostHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/harvests', {
        method: 'POST',
        token,
        body: JSON.stringify({
          crop_name: cropName,
          estimated_kg: Number(estimatedKg),
          status
        })
      });
      setShowHarvestForm(false);
      setCropName("");
      setEstimatedKg("");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to post harvest");
    }
  };

  const handleFulfillDemand = async (demandId: string) => {
    const qty = prompt("How many kg can you allocate to this demand?");
    const price = prompt("What is your price per kg?");
    if (!qty || !price) return;

    try {
      await apiFetch('/allocations', {
        method: 'POST',
        token,
        body: JSON.stringify({
          demand_id: demandId,
          allocated_kg: Number(qty),
          price_per_kg: Number(price),
          message: "I can fulfill this request."
        })
      });
      alert("Offer sent to consumer!");
    } catch (err: any) {
      alert(err.message || "Failed to send offer");
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar visible={true} />
      <main className="min-h-screen pt-24 pb-12 bg-warm-50">
        <div className="container-wide">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your harvests and respond to community needs.</p>
          </div>

          {user?.role !== "farmer" ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <Icon icon="mdi:lock" width={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="text-gray-500">This dashboard is specifically for farmers.</p>
            </div>
          ) : loadingData ? (
            <div className="flex justify-center p-12">
              <Icon icon="mdi:loading" className="animate-spin text-sage-500" width={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* My Harvests */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Harvests</h2>
                  <button 
                    onClick={() => setShowHarvestForm(!showHarvestForm)}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    <Icon icon="mdi:plus" /> Log Harvest
                  </button>
                </div>

                {showHarvestForm && (
                  <form onSubmit={handlePostHarvest} className="bg-sage-50 p-4 rounded-xl mb-6 flex flex-col gap-3 border border-sage-100">
                    <input 
                      type="text" required placeholder="Crop Name (e.g. Tomatoes)" value={cropName} onChange={e => setCropName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" required placeholder="Estimated kg" value={estimatedKg} onChange={e => setEstimatedKg(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500"
                      />
                      <select 
                        value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 bg-white"
                      >
                        <option value="growing">Growing</option>
                        <option value="ready">Ready for Harvest</option>
                        <option value="harvested">Harvested</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-sage-500 text-white rounded-lg py-2 font-medium">Save Harvest</button>
                  </form>
                )}

                <div className="space-y-4">
                  {harvests.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">You haven't logged any harvests yet.</p>
                  ) : (
                    harvests.map(h => (
                      <div key={h.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div>
                          <div className="font-semibold text-gray-900">{h.crop_name}</div>
                          <div className="text-sm text-gray-500">Estimated: {h.estimated_kg}kg</div>
                        </div>
                        <span className="px-3 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full uppercase tracking-wide">
                          {h.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Community Demands */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Open Community Demands</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {demands.filter(d => d.status === 'open').length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No open demands right now.</p>
                  ) : (
                    demands.filter(d => d.status === 'open').map(d => (
                      <div key={d.id} className="p-4 border border-gray-100 rounded-xl bg-[#f4f8f2]">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-gray-900">{d.crop_name}</div>
                          <span className="text-sm font-bold text-[#e8533a]">{d.quantity_kg}kg needed</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                          <Icon icon="mdi:map-marker" /> {d.location || 'Nearby'}
                        </p>
                        <button 
                          onClick={() => handleFulfillDemand(d.id)}
                          className="w-full bg-white border-2 border-[#4e8c3f] text-[#4e8c3f] hover:bg-[#4e8c3f] hover:text-white transition-colors rounded-lg py-1.5 text-sm font-medium"
                        >
                          Offer to Fulfill
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
