"use client";

import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  X, 
  Loader2, 
  Download, 
  CalendarPlus, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: {
    id?: string;
    full_name: string;
    title?: string;
    company?: string;
    booking_title?: string;
    booking_days?: string[];
    booking_start_time?: string;
    booking_end_time?: string;
    booking_slot_duration?: number;
  };
}

export function BookingModal({ isOpen, onClose, card }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allowedDays = useMemo(() => {
    return (
      card.booking_days || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ]
    );
  }, [card.booking_days]);

  const durationMinutes = card.booking_slot_duration || 30;
  const startTimeStr = card.booking_start_time || "09:00";
  const endTimeStr = card.booking_end_time || "17:00";
  const meetingTitle = card.booking_title || `${durationMinutes}-Min Meeting with ${card.full_name}`;

  // Generate the next 14 valid dates
  const availableDates = useMemo(() => {
    const dates: { fullDate: string; dayName: string; displayDate: string; isAllowed: boolean }[] = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const today = new Date();
    for (let i = 1; i <= 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayName = dayNames[d.getDay()];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateNum = String(d.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${dateNum}`;
      const displayDate = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const isAllowed = allowedDays.includes(dayName);

      if (isAllowed) {
        dates.push({ fullDate, dayName, displayDate, isAllowed });
      }
    }
    return dates;
  }, [allowedDays]);

  // Set default date when available
  React.useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].fullDate);
    }
  }, [availableDates, selectedDate]);

  // Generate available time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);

    let currentMinutes = (startH || 9) * 60 + (startM || 0);
    const endMinutes = (endH || 17) * 60 + (endM || 0);

    while (currentMinutes + durationMinutes <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeString = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push(timeString);
      currentMinutes += durationMinutes;
    }

    return slots;
  }, [startTimeStr, endTimeStr, durationMinutes]);

  // Set default time slot
  React.useEffect(() => {
    if (timeSlots.length > 0 && !selectedTime) {
      setSelectedTime(timeSlots[0]);
    }
  }, [timeSlots, selectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorEmail || !selectedDate || !selectedTime) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          visitorName,
          visitorEmail,
          visitorPhone,
          meetingDate: selectedDate,
          meetingTime: selectedTime,
          meetingNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule booking.");
      }

      setIsBooked(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to book meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!selectedDate || !selectedTime) return;

    const [h, m] = selectedTime.split(":").map(Number);
    const startObj = new Date(`${selectedDate}T${selectedTime}:00`);
    const endObj = new Date(startObj.getTime() + durationMinutes * 60000);

    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Digital Business Card//Meeting Scheduler//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:dbc-meet-${Date.now()}@card.app`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startObj)}`,
      `DTEND:${formatIcsDate(endObj)}`,
      `SUMMARY:${meetingTitle}`,
      `DESCRIPTION:Meeting scheduled with ${card.full_name} via Digital Business Card.\\nNotes: ${meetingNotes}`,
      `ORGANIZER;CN=${card.full_name}:mailto:support@card.app`,
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${visitorName}:mailto:${visitorEmail}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-${card.full_name.toLowerCase().replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGoogleCalendar = () => {
    if (!selectedDate || !selectedTime) return;
    const startObj = new Date(`${selectedDate}T${selectedTime}:00`);
    const endObj = new Date(startObj.getTime() + durationMinutes * 60000);
    const formatGDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

    const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      meetingTitle
    )}&dates=${formatGDate(startObj)}/${formatGDate(endObj)}&details=${encodeURIComponent(
      `Meeting with ${card.full_name} (${card.title || ""}). Notes: ${meetingNotes}`
    )}`;

    window.open(gUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-[36px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Mobile Cupertino Grab Bar */}
        <div className="sm:hidden w-10 h-1.5 bg-black/20 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-[#FBFBFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F]">{meetingTitle}</h2>
              <p className="text-[11px] text-[#86868B]">
                {card.full_name} • {card.company || "Executive"} ({durationMinutes} mins)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {isBooked ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-green-50 text-[#34C759] mx-auto flex items-center justify-center border-2 border-green-500/20 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1D1D1F]">Meeting Confirmed!</h3>
                <p className="text-xs text-[#86868B]">
                  A calendar invite has been reserved for <strong className="text-[#1D1D1F]">{selectedDate}</strong> at <strong className="text-[#1D1D1F]">{selectedTime}</strong> with {card.full_name}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Attendee:</span>
                  <span className="font-medium text-[#1D1D1F]">{visitorName} ({visitorEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Duration:</span>
                  <span className="font-medium text-[#1D1D1F]">{durationMinutes} Minutes</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="w-full py-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ICS File (Apple / Outlook)</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoogleCalendar}
                  className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add to Google Calendar</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F] underline pt-2"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Step 1: Date Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1.5 pl-1">
                  1. Select Available Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.fullDate;
                    return (
                      <button
                        key={item.fullDate}
                        type="button"
                        onClick={() => setSelectedDate(item.fullDate)}
                        className={`p-2.5 rounded-2xl border text-center shrink-0 min-w-[76px] transition-all ${
                          isSelected
                            ? "border-[#0071E3] bg-[#0071E3] text-white shadow-xs font-semibold"
                            : "border-black/[0.06] bg-[#F5F5F7] text-neutral-700 hover:border-black/[0.15]"
                        }`}
                      >
                        <span className={`block text-[10px] uppercase ${isSelected ? "text-white/80" : "text-[#86868B]"}`}>
                          {item.dayName.slice(0, 3)}
                        </span>
                        <span className="block text-xs font-bold mt-0.5">
                          {item.displayDate}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Time Slot Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1.5 pl-1">
                  2. Select Time Slot ({durationMinutes} mins)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 rounded-xl text-center text-xs font-mono transition-all ${
                          isSelected
                            ? "bg-black text-white font-semibold shadow-xs"
                            : "bg-[#F5F5F7] text-neutral-700 hover:bg-[#EAEAEA] border border-black/[0.04]"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Visitor Details */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase pl-1">
                  3. Your Contact Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Your Full Name *"
                      className="w-full px-3 py-2.5 pl-8 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                    />
                    <User className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5" />
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="Your Email *"
                      className="w-full px-3 py-2.5 pl-8 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                    />
                    <Mail className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5" />
                  </div>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="Your Phone Number (Optional)"
                    className="w-full px-3 py-2.5 pl-8 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                  <Phone className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5" />
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Briefly state meeting agenda or topics to discuss..."
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {errorMsg}
                </div>
              )}

              <label className="flex items-start gap-2 text-[10px] text-neutral-500 my-4 cursor-pointer px-1">
                <input type="checkbox" required className="mt-0.5 rounded border-neutral-300 text-[#0071E3] focus:ring-[#0071E3]" />
                <span>I agree to share my contact information and meeting details with the card owner in accordance with the Privacy Policy.</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Schedule...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Book Slot ({selectedDate} @ {selectedTime})</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
