"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"consumer" | "farmer">("consumer");
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data.display_name) {
          const addr = data.address;
          const simplified = `${addr.city || addr.town || addr.village || addr.suburb || ''}, ${addr.state || addr.country || ''}`.replace(/^, /, '');
          setLocation(simplified);
        }
      } catch (err) {
        console.error("Location detection failed", err);
      } finally {
        setDetecting(false);
      }
    }, (err) => {
      console.error(err);
      setDetecting(false);
      alert("Please enable location permissions to use this feature.");
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const response = await apiFetch<{ user: any; session: any }>('/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        login(response.session.access_token, response.user);
        onClose();
      } else {
        const response = await apiFetch<{ user: any; session: any }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, full_name: fullName, role, location }),
        });
        if (response.session) {
          login(response.session.access_token, response.user);
          onClose();
        } else {
          setError("Account created, but could not auto-login. Please log in manually.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#e8ede0] p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-sm border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Icon icon="mdi:close" width={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white">
              <Icon icon="mdi:leaf" width={20} />
            </div>
            <span className="font-bold text-gray-800 text-lg">HarvestLink</span>
          </div>
          
          <div className="text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all bg-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1.5">I am a...</label>
                    <select 
                      value={role} 
                      onChange={e => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 bg-white"
                    >
                      <option value="consumer">Consumer</option>
                      <option value="farmer">Farmer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1.5">Location</label>
                    <div className="flex items-center w-full rounded-md border border-gray-300 focus-within:ring-1 focus-within:ring-green-600 focus-within:border-green-600 bg-white overflow-hidden transition-all">
                      <input 
                        type="text" 
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
                        placeholder="City, State"
                      />
                      <div className="flex items-center pr-1 gap-0.5 border-l border-gray-100 ml-1">
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className={`p-1.5 rounded-md transition-all ${showMap ? 'bg-green-50 text-green-700' : 'text-gray-400 hover:text-green-600 hover:bg-gray-50'}`}
                          title="Open Map"
                        >
                          <Icon icon="mdi:map-search" width={20} />
                        </button>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={detecting}
                          className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-gray-50 transition-all"
                          title="Current Location"
                        >
                          <Icon icon={detecting ? "mdi:loading" : "mdi:crosshairs-gps"} className={detecting ? "animate-spin" : ""} width={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {showMap && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <LocationPicker onSelect={(loc) => { setLocation(loc); setShowMap(false); }} />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1.5">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all bg-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1.5">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all bg-white"
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full py-2.5 px-4 rounded-md text-sm font-bold text-white transition-all bg-green-800 hover:bg-green-900 shadow-sm"
            >
              {loading ? "Processing..." : isLogin ? "Log in to your account" : "Create your account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 text-xs font-medium">
              {isLogin ? "Don't have an account yet? " : "Already have an account? "}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-green-700 font-bold hover:underline text-xs"
            >
              {isLogin ? "Sign up here" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
