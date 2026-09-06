import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bikerAPI } from '../services/api';

const CITIES = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Jaipur',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
];

function AddSlot() {
  const { bikeId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    pricePerHour: '',
    city: '',
    pickupLocation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    
    if (start >= end) {
      setError('End time must be after start time');
      return;
    }

    if (start < new Date()) {
      setError('Start time cannot be in the past');
      return;
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 24) {
      setError('Availability slot duration cannot exceed 24 hours');
      return;
    }

    setLoading(true);

    try {
      const slotData = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        pricePerHour: parseInt(formData.pricePerHour),
        city: formData.city,
        pickupLocation: formData.pickupLocation,
      };

      await bikerAPI.addSlot(bikeId, slotData);
      
      setSuccess('Availability slot added successfully!');
      
      setFormData({
        startTime: '',
        endTime: '',
        pricePerHour: formData.pricePerHour,
        city: formData.city,
        pickupLocation: formData.pickupLocation,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-slate-955 text-neutral-800 dark:text-slate-100 min-h-[85vh] transition-colors duration-200">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Add Availability Slot</h1>
        <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">Set when your bike is available for rent</p>
        {bikeId && (
          <p className="text-xs text-rose-500 dark:text-rose-455 font-bold uppercase tracking-wider mt-2">Bike ID: {bikeId}</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-805 dark:text-emerald-400 rounded-xl text-sm font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 text-emerald-500 dark:text-emerald-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Start Date & Time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-850 dark:text-white outline-none transition-colors text-sm font-semibold cursor-pointer"
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="endTime" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              End Date & Time
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-855 dark:text-white outline-none transition-colors text-sm font-semibold cursor-pointer"
            />
          </div>

          {/* Price Per Hour */}
          <div>
            <label htmlFor="pricePerHour" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Price Per Hour (₹)
            </label>
            <input
              id="pricePerHour"
              name="pricePerHour"
              type="number"
              required
              min="1"
              value={formData.pricePerHour}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-850 dark:text-white outline-none transition-colors text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500"
              placeholder="e.g., 50"
            />
            <p className="text-xs text-neutral-400 dark:text-slate-500 mt-1.5 font-medium">You can set different rates for different time slots</p>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              City
            </label>
            <div className="relative">
              <select
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-850 dark:text-white outline-none transition-colors text-sm font-semibold cursor-pointer appearance-none"
              >
                <option value="" className="text-neutral-400 dark:text-slate-500">Select a city...</option>
                {CITIES.map((city) => (
                  <option key={city} value={city} className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-200">
                    {city}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500 dark:text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label htmlFor="pickupLocation" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Pickup Location
            </label>
            <input
              id="pickupLocation"
              name="pickupLocation"
              type="text"
              required
              value={formData.pickupLocation}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-850 dark:text-white outline-none transition-colors text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500"
              placeholder="e.g., Near Rajiv Chowk Metro Station"
            />
            <p className="text-xs text-neutral-400 dark:text-slate-500 mt-1.5 font-medium">Provide a recognizable landmark or address</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/my-bikes')}
              className="flex-1 px-4 py-3 border border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-300 rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-slate-800 text-sm transition-colors"
            >
              Back to My Bikes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center font-bold">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Slot...
                </span>
              ) : (
                'Add Slot'
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Tips for setting availability:</h4>
          <ul className="text-xs text-neutral-500 dark:text-slate-400 space-y-1.5 font-semibold">
            <li>- Set longer slots for better chances of booking</li>
            <li>- Weekend rates can be higher due to demand</li>
            <li>- Choose a central pickup location for convenience</li>
            <li>- You can add multiple slots for different time periods</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddSlot;
