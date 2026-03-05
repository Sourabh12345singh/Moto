import { useState, useMemo } from 'react';
import { userAPI } from '../services/api';

function BookingModal({ bike, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse slot boundaries
  const slotStart = new Date(bike.startHour);
  const slotEnd = new Date(bike.endHour);

  // Generate available hour options within the slot window
  // Each option is a full hour mark (e.g., 9:00, 10:00, 11:00)
  const hourOptions = useMemo(() => {
    const options = [];
    const current = new Date(slotStart);
    // Round up to next full hour if slot doesn't start on the hour
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
    // If current end is not after new start, reset end to next hour
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

  // Format LocalDateTime for the backend (ISO without timezone)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Book This Bike</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Bike Details */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              {bike.company} {bike.model}
            </h3>
            <p className="text-gray-500 text-sm">
              {bike.pickupLocation}, {bike.city}
            </p>
          </div>

          {/* Available Window Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
            <p className="text-green-800 text-xs font-medium uppercase tracking-wide mb-1">Available Window</p>
            <p className="text-green-700 text-sm font-medium">
              {formatDate(slotStart)}
            </p>
            <p className="text-green-700 text-sm">
              {formatTime(slotStart)} &mdash; {formatTime(slotEnd)}
            </p>
          </div>

          {/* Custom Time Selection */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Choose Your Hours</p>

            {hourOptions.length < 2 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  This slot is too short for custom booking. Minimum 1 hour required.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time Picker */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                  <select
                    value={selectedStartIdx}
                    onChange={handleStartChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  >
                    {hourOptions.map((opt, idx) => {
                      // Don't allow selecting the last hour as start (no room for 1hr booking)
                      if (idx >= hourOptions.length - 1) return null;
                      return (
                        <option key={idx} value={idx}>
                          {formatTime(opt)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* End Time Picker */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Time</label>
                  <select
                    value={selectedEndIdx}
                    onChange={handleEndChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  >
                    {endHourOptions.map((opt) => {
                      const idx = hourOptions.indexOf(opt);
                      return (
                        <option key={idx} value={idx}>
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
            <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Booking Summary</p>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">From</span>
                <span className="font-medium text-sm">{formatDateTime(selectedStart)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">To</span>
                <span className="font-medium text-sm">{formatDateTime(selectedEnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Duration</span>
                <span className="font-medium text-sm">{durationHours} hour{durationHours > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Rate</span>
                <span className="font-medium text-sm">Rs {bike.pricePerHour}/hour</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">Total Amount</span>
                <span className="text-primary-600 font-bold text-lg">Rs {totalPrice}</span>
              </div>
            </div>
          )}

          {/* Pickup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-800 font-medium text-sm">Pickup Location</p>
                <p className="text-blue-700 text-sm mt-1">
                  {bike.pickupLocation}, {bike.city}
                </p>
                <p className="text-blue-600 text-xs mt-2">
                  A 30-minute buffer is added after your booking for bike return.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={loading || !isValid}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking...
                </span>
              ) : (
                `Book for Rs ${totalPrice}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
