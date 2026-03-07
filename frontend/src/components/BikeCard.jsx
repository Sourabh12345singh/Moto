function BikeCard({ bike, onBook, hideBookButton = false, kycApproved = true }) {
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Bike Image */}
      {bike.imageUrl ? (
        <img
          src={bike.imageUrl}
          alt={`${bike.company} ${bike.model}`}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
      )}

      <div className="p-5">
        {/* Bike Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {bike.company} {bike.model}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {bike.pickupLocation}, {bike.city}
          </div>
        </div>

        {/* Slot Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Available Slot</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-gray-700">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDateTime(bike.startHour)}
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDateTime(bike.endHour)}
            </div>
          </div>
        </div>

        {/* Price & Book Button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">Rs {bike.pricePerHour}</span>
            <span className="text-gray-500 text-sm">/hour</span>
          </div>
          {!hideBookButton && (
            kycApproved ? (
              <button
                onClick={() => onBook(bike)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Book Now
              </button>
            ) : (
              <button
                onClick={() => onBook(bike)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors text-sm"
              >
                Complete KYC to Book
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default BikeCard;
