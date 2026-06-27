import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import api from "../services/api";

const WhatsApp = () => {
  const [status, setStatus] = useState("not_connected");
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState("");
  const [phone, setPhone] = useState("");
  const [lastConnected, setLastConnected] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshWhatsApp = async () => {
  try {
    const statusRes = await api.get("/whatsapp/status");

    setConnected(statusRes.data.connected);
    setStatus(statusRes.data.status);
    setPhone(statusRes.data.phoneNumber || "");
    setProfile(statusRes.data.profileName || "");
    setLastConnected(statusRes.data.lastConnected || "");

    if (statusRes.data.connected) {
      setQrCode("");
      return;
    }

    try {
      const qrRes = await api.get("/whatsapp/qr");

      if (qrRes.data.success) {
        setQrCode(qrRes.data.qr);
      }
    } catch {
      // QR not generated yet
      setQrCode("");
    }

  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    refreshWhatsApp();

    const interval = setInterval(() => {
        refreshWhatsApp();
    }, 2000);

    return () => clearInterval(interval);
}, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/whatsapp/connect");

      const interval = setInterval(async () => {
        try {
          const qrRes = await api.get("/whatsapp/qr");

          if (qrRes.data.success) {
            setQrCode(qrRes.data.qr);
          }

          const statusRes = await api.get("/whatsapp/status");

          setConnected(statusRes.data.connected);
          setStatus(statusRes.data.status);
          setPhone(statusRes.data.phoneNumber || "");
          setProfile(statusRes.data.profileName || "");
          setLastConnected(statusRes.data.lastConnected || "");

          if (statusRes.data.connected) {
            clearInterval(interval);
            setQrCode("");
          }
        } catch (err) {}
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to connect.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post("/whatsapp/logout");

      setConnected(false);
      setStatus("disconnected");
      setPhone("");
      setProfile("");
      setLastConnected("");
      setQrCode("");
    } catch (err) {
      console.log(err);
    }
  };

  const statusColor = connected
    ? "bg-green-500/20 text-green-400"
    : "bg-red-500/20 text-red-400";


      return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">

      {/* Header */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          WhatsApp Integration
        </h1>

        <p className="text-slate-400 mt-2 max-w-2xl">
          Connect your WhatsApp account to automatically send
          AI-generated payment reminders directly to your
          clients.
        </p>

      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500 text-red-400 px-5 py-3">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* LEFT CARD */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-7">

          <div className="flex justify-between items-center mb-8">

            <h2 className="text-2xl font-semibold">
              Connection Status
            </h2>

            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold ${statusColor}`}
            >
              {connected ? "Connected" : "Disconnected"}
            </span>

          </div>

          <div className="space-y-6">

            <div>
              <p className="text-slate-400 text-sm">
                {phone ? "Phone Number" : "No Phone Connected"}
              </p>

              <p className="text-lg font-medium">
                {phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">
                {profile ? "Profile Name" : "No Profile Connected"}
              </p>

              <p className="text-lg font-medium">
                {profile || "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">
                {lastConnected ? "Last Connected" : "No Connection Time"}
              </p>

              <p className="text-lg font-medium">
                {lastConnected
                  ? new Date(lastConnected).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">
                {status ? "Current Status" : "No Status Available"}
              </p>

              <p className="capitalize text-lg">
                {status ? status.replace("_", " ") : "-"}
              </p>
            </div>

          </div>

          <div className="mt-10">

            {!connected ? (

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 transition rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {loading
                  ? "Connecting..."
                  : "Connect WhatsApp"}
              </button>

            ) : (

              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 hover:bg-red-700 transition rounded-xl py-3 font-semibold"
              >
                Disconnect WhatsApp
              </button>

            )}

          </div>

        </div>

        {/* RIGHT CARD */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-7 flex flex-col items-center justify-center">

          {!connected ? (

            <>
              <h2 className="text-2xl font-semibold mb-6">
                Scan QR Code
              </h2>

              {qrCode ? (

                <div className="bg-white p-5 rounded-xl">

                  <QRCode
                    value={qrCode}
                    size={230}
                  />

                </div>

              ) : (

                <div className="h-[270px] w-[270px] rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                  QR Code will appear here
                </div>

              )}

              <div className="mt-8 text-center text-slate-400 leading-7">

                <p>
                  Open WhatsApp on your phone
                </p>

                <p>
                  Settings
                </p>

                <p>
                  Linked Devices
                </p>

                <p>
                  Link a Device
                </p>

                <p className="mt-5">
                  Scan the QR code shown above.
                </p>

              </div>

            </>

          ) : (

            <>
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6">

                <span className="text-5xl">
                  ✅
                </span>

              </div>

              <h2 className="text-3xl font-bold text-green-400">
                WhatsApp Connected
              </h2>

              <p className="text-slate-400 text-center mt-4 max-w-md leading-7">
                Your WhatsApp account is connected successfully.
                CollectAI can now automatically send AI-generated
                payment reminders to your clients.
              </p>

            </>

          )}

        </div>

      </div>
    </div>
  );
};

export default WhatsApp;