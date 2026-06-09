function BikeCard({ bike, onBook, hideBookButton = false, kycApproved = true }) {
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,180,212,0.15)] transition-all duration-300 shadow-xl group flex flex-col h-full">
      {/* Bike Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        {bike.imageUrl ? (
          <img
            src={bike.imageUrl}
            alt={`${bike.company} ${bike.model}`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
            <svg className="w-16 h-16 text-slate-800 stroke-[1.5] group-hover:text-cyan-500/50 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
          Available
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Bike Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">
            {bike.company} {bike.model}
          </h3>
          <div className="flex items-center text-xs text-slate-400 mt-1.5 font-mono">
            <svg className="w-4 h-4 mr-1.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {bike.pickupLocation}, {bike.city.toUpperCase()}
          </div>
        </div>

        {/* Slot Info */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 mb-6 flex-grow">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2.5">Available timeslot</div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2.5 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 uppercase w-8">Start:</span>
              <span className="text-slate-300">{formatDateTime(bike.startHour)}</span>
            </div>
            <div className="flex items-center text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2.5 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 uppercase w-8">End:</span>
              <span className="text-slate-300">{formatDateTime(bike.endHour)}</span>
            </div>
          </div>
        </div>

        {/* Price & Book Button */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-900">
          <div>
            <span className="text-2xl font-bold font-mono text-cyan-400">Rs {bike.pricePerHour}</span>
            <span className="text-slate-500 text-[10px] font-mono uppercase">/hr</span>
          </div>
          {!hideBookButton && (
            kycApproved ? (
              <button
                onClick={() => onBook(bike)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-[0_0_15px_rgba(6,180,212,0.25)] hover:shadow-[0_0_20px_rgba(6,180,212,0.45)] transform active:scale-95 font-mono uppercase tracking-wider"
              >
                Acquire
              </button>
            ) : (
              <button
                onClick={() => onBook(bike)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 px-3.5 py-2.5 rounded-xl text-xs transition-colors font-mono uppercase tracking-wider border border-slate-700"
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
