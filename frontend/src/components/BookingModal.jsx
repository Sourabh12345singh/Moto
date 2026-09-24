import { useState, useMemo } from 'react';
import { userAPI } from '../services/api';

function BookingModal({ bike, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse slot boundaries
  const slotStart = new Date(bike.startHour);
  const slotEnd = new Date(bike.endHour);

  // Generate available hour options within the slot window
  const hourOptions = useMemo(() => {
    const options = [];
    const current = new Date(slotStart);
    if (current.getMinutes() > 0) {
      current.setHours(current.getHours() + 1, 0, 0, 0);
    } else {
      current.setMinutes(0, 0, 0);
    }

    while (current < slotEnd) {
      options.push(new Date(current));
      current.setHours(current.getHours() + 1);
    }
    return options;
  }, [bike.startHour, bike.endHour]);

  // Default: first available hour as start, one hour later as end
  const [selectedStartIdx, setSelectedStartIdx] = useState(0);
  const [selectedEndIdx, setSelectedEndIdx] = useState(
    hourOptions.length >= 2 ? 1 : 0
  );

  const selectedStart = hourOptions[selectedStartIdx] || slotStart;
  const selectedEnd = hourOptions[selectedEndIdx] || slotEnd;

  // Calculate duration and price
  const durationMs = selectedEnd - selectedStart;
  const durationHours = Math.max(0, Math.ceil(durationMs / (1000 * 60 * 60)));
  const totalPrice = durationHours * bike.pricePerHour;
  const isValid = durationHours >= 1 && selectedStart < selectedEnd;

  // End hour options: only hours after the selected start (at least 1 hour gap)
  const endHourOptions = useMemo(() => {
    return hourOptions.filter((_, idx) => idx > selectedStartIdx);
  }, [hourOptions, selectedStartIdx]);

  // When start changes, ensure end is still valid
  const handleStartChange = (e) => {
    const newStartIdx = parseInt(e.target.value);
    setSelectedStartIdx(newStartIdx);
    if (selectedEndIdx <= newStartIdx) {
      const nextValidEnd = newStartIdx + 1;
      if (nextValidEnd < hourOptions.length) {
        setSelectedEndIdx(nextValidEnd);
      }
    }
  };

  const handleEndChange = (e) => {
    setSelectedEndIdx(parseInt(e.target.value));
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const toLocalDateTimeString = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleConfirmBooking = async () => {
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      await userAPI.bookBike(
        bike.slotId,
        toLocalDateTimeString(selectedStart),
        toLocalDateTimeString(selectedEnd)
      );
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.message
        || err.response?.data
        || 'Failed to book. Please try again.';
      setError(typeof message === 'string' ? message : 'Failed to book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-150 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Book Your Ride</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 dark:text-slate-500 hover:text-neutral-600 dark:hover:text-slate-350 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Bike Details */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {bike.company} {bike.model}
            </h3>
            <p className="text-neutral-500 dark:text-slate-450 text-sm mt-1">
              {bike.pickupLocation}, {bike.city}
            </p>
          </div>

          {/* Available Window Info */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 mb-5">
            <p className="text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">Available Window</p>
            <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
              {formatDate(slotStart)}
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
              {formatTime(slotStart)} &mdash; {formatTime(slotEnd)}
            </p>
          </div>

          {/* Custom Time Selection */}
          <div className="mb-5">
            <p className="text-sm font-bold text-neutral-700 dark:text-slate-300 mb-3">Choose Your Hours</p>

            {hourOptions.length < 2 ? (
              <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                <p className="text-amber-800 dark:text-amber-400 text-sm font-medium">
                  This slot is too short for custom booking. Minimum 1 hour required.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time Picker */}
                <div>
                  <label className="block text-xs font-bold text-neutral-450 dark:text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                  <select
                    value={selectedStartIdx}
                    onChange={handleStartChange}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-xl text-neutral-800 dark:text-slate-100 focus:border-rose-500 outline-none text-sm font-semibold cursor-pointer"
                  >
                    {hourOptions.map((opt, idx) => {
                      if (idx >= hourOptions.length - 1) return null;
                      return (
                        <option key={idx} value={idx} className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-white">
                          {formatTime(opt)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* End Time Picker */}
                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                  <select
                    value={selectedEndIdx}
                    onChange={handleEndChange}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-xl text-neutral-800 dark:text-slate-100 focus:border-rose-500 outline-none text-sm font-semibold cursor-pointer"
                  >
                    {endHourOptions.map((opt) => {
                      const idx = hourOptions.indexOf(opt);
                      return (
                        <option key={idx} value={idx} className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-white">
                          {formatTime(opt)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          {isValid && (
            <div className="bg-neutral-50 dark:bg-slate-850/50 border border-neutral-100 dark:border-slate-800 rounded-xl p-4 mb-5 space-y-3">
              <p className="text-xs text-neutral-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Booking Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-slate-450 font-medium">From</span>
                <span className="font-semibold text-neutral-800 dark:text-slate-200">{formatDateTime(selectedStart)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-slate-455 font-medium">To</span>
                <span className="font-semibold text-neutral-800 dark:text-slate-200">{formatDateTime(selectedEnd)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-slate-450 font-medium">Duration</span>
                <span className="font-semibold text-neutral-800 dark:text-slate-200">{durationHours} hour{durationHours > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-slate-450 font-medium">Rate</span>
                <span className="font-semibold text-neutral-800 dark:text-slate-200">₹{bike.pricePerHour}/hour</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                <span className="text-neutral-900 dark:text-white font-bold">Total Amount</span>
                <span className="text-rose-500 dark:text-rose-400 font-extrabold text-xl">₹{totalPrice}</span>
              </div>
            </div>
          )}

          {/* Pickup Instructions */}
          <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 mb-5">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-850 dark:text-blue-300 font-bold text-sm">Pickup Instructions</p>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  {bike.pickupLocation}, {bike.city}
                </p>
                <p className="text-blue-550 dark:text-blue-500 text-xs mt-2 font-medium">
                  A 30-minute buffer is added after your booking for bike return.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-300 rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-slate-800 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={loading || !isValid}
              className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming Booking...
                </span>
              ) : (
                `Confirm • ₹${totalPrice}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
