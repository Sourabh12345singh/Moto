function BikeCard({ bike, onBook, hideBookButton = false, kycApproved = true }) {
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-slate-950/50 transition-all duration-300 flex flex-col h-full group">
      {/* Bike Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 dark:bg-slate-850">
        {bike.imageUrl ? (
          <img
            src={bike.imageUrl}
            alt={`${bike.company} ${bike.model}`}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-neutral-100 dark:bg-slate-800 flex items-center justify-center">
            {/* Motorcycle / bike placeholder icon */}
            <svg className="w-16 h-16 text-neutral-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors duration-200">
            {bike.company} {bike.model}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center text-xs text-neutral-500 dark:text-slate-400 mb-3">
          <svg className="w-3.5 h-3.5 mr-1 text-neutral-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {bike.pickupLocation}, {bike.city}
        </div>

        {/* Available Slot */}
        <div className="bg-neutral-50 dark:bg-slate-850/50 border border-neutral-100 dark:border-slate-800 rounded-xl p-3 mb-4 flex-grow">
          <div className="text-[10px] text-neutral-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1.5">Availability Slot</div>
          <div className="space-y-1 text-xs text-neutral-700 dark:text-slate-355 font-medium">
            <div className="flex justify-between">
              <span className="text-neutral-400 dark:text-slate-500">From:</span>
              <span className="text-neutral-750 dark:text-slate-300">{formatDateTime(bike.startHour)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 dark:text-slate-500">To:</span>
              <span className="text-neutral-750 dark:text-slate-300">{formatDateTime(bike.endHour)}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-slate-800">
          <div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">₹{bike.pricePerHour}</span>
            <span className="text-neutral-500 dark:text-slate-450 text-xs font-normal"> / hour</span>
          </div>
          {!hideBookButton && (
            kycApproved ? (
              <button
                onClick={() => onBook(bike)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 transform active:scale-95 shadow-sm"
              >
                Book Now
              </button>
            ) : (
              <button
                onClick={() => onBook(bike)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 transform active:scale-95 shadow-sm"
              >
                Verify KYC
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default BikeCard;
