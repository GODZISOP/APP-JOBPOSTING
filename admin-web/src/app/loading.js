export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>
        Loading Data...
      </p>

      <style>{`
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(232, 245, 66, 0.1); /* light lime */
          border-left-color: var(--accent-color); /* lime yellow */
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
