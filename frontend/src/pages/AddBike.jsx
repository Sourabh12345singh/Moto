import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AddBike() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: '',
    model: '',
    ratePerHour: '',
    bikeNumber: '',
    rcNumber: '',
    kms: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bikeData = {
        company: formData.company,
        model: formData.model,
        ratePerHour: parseInt(formData.ratePerHour),
        bikeNumber: formData.bikeNumber.toUpperCase(),
        rcNumber: formData.rcNumber.toUpperCase(),
        kms: parseInt(formData.kms),
      };

      await bikerAPI.addBike(user.userId, bikeData);
      
      // Redirect to my bikes page with success message
      navigate('/my-bikes', { state: { message: 'Bike added successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bike. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Bike</h1>
        <p className="text-gray-600 mt-2">List your bike and start earning</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Bike Company/Brand
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="e.g., Royal Enfield, Honda, TVS"
            />
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              id="model"
              name="model"
              type="text"
              required
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="e.g., Classic 350, Activa 6G, Apache RTR 160"
            />
          </div>

          {/* Rate Per Hour */}
          <div>
            <label htmlFor="ratePerHour" className="block text-sm font-medium text-gray-700 mb-1">
              Rate Per Hour (Rs)
            </label>
            <input
              id="ratePerHour"
              name="ratePerHour"
              type="number"
              required
              min="1"
              value={formData.ratePerHour}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="e.g., 50"
            />
            <p className="text-xs text-gray-500 mt-1">Set a competitive hourly rate for your bike</p>
          </div>

          {/* Bike Number */}
          <div>
            <label htmlFor="bikeNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Bike Registration Number
            </label>
            <input
              id="bikeNumber"
              name="bikeNumber"
              type="text"
              required
              value={formData.bikeNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors uppercase"
              placeholder="e.g., DL01AB1234"
            />
          </div>

          {/* RC Number */}
          <div>
            <label htmlFor="rcNumber" className="block text-sm font-medium text-gray-700 mb-1">
              RC (Registration Certificate) Number
            </label>
            <input
              id="rcNumber"
              name="rcNumber"
              type="text"
              required
              value={formData.rcNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors uppercase"
              placeholder="e.g., DL01AB1234"
            />
          </div>

          {/* Kilometers */}
          <div>
            <label htmlFor="kms" className="block text-sm font-medium text-gray-700 mb-1">
              Kilometers Driven
            </label>
            <input
              id="kms"
              name="kms"
              type="number"
              required
              min="0"
              value={formData.kms}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="e.g., 15000"
            />
            <p className="text-xs text-gray-500 mt-1">Odometer reading in kilometers</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
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
                  Adding Bike...
                </span>
              ) : (
                'Add Bike'
              )}
            </button>
          </div>
        </form>

        {/* Next Steps Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Next step:</span> After adding your bike, you'll need to create availability slots to let riders know when your bike is available for rent.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddBike;
