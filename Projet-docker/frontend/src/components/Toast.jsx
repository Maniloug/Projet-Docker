function Toast({ message, type = 'success', onClose }) {
  const accent = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700';
  const dot = type === 'success' ? 'bg-green-500' : 'bg-slate-400';

  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl ${accent}`}>
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true"></span>
      <p className="flex-1 font-medium text-slate-900">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-500 transition hover:text-slate-900"
        aria-label="Fermer la notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
