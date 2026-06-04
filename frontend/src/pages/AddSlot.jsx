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

    // Validate times
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
      
      // Reset form for adding another slot
      setFormData({
        startTime: '',
        endTime: '',
        pricePerHour: formData.pricePerHour, // Keep the price
        city: formData.city, // Keep the city
        pickupLocation: formData.pickupLocation, // Keep the location
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Availability Slot</h1>
        <p className="text-gray-600 mt-2">Set when your bike is available for rent</p>
        {bikeId && (
          <p className="text-sm text-primary-600 mt-1">Bike ID: {bikeId}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          {/* Price Per Hour */}
          <div>
            <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Hour (Rs)
            </label>
            <input
              id="pricePerHour"
              name="pricePerHour"
              type="number"
              required
              min="1"
              value={formData.pricePerHour}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="e.g., 50"
            />
            <p className="text-xs text-gray-500 mt-1">You can set different rates for different time slots</p>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            >
              <option value="">Select a city...</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Location */}
          <div>
            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location
            </label>
            <input
              id="pickupLocation"
              name="pickupLocation"
              type="text"
              required
              value={formData.pickupLocation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="e.g., Near Metro Station, Sector 18"
            />
            <p className="text-xs text-gray-500 mt-1">Provide a recognizable landmark or address</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/my-bikes')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to My Bikes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tips for setting availability:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
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
