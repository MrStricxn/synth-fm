// SYNTH.FM brand mark — a retro synthwave sun (sliced lower half) sitting over
// a soundwave, drawn with the brand gradient. Scales via the `size` prop.
export default function Logo({ size = 30, withText = false }) {
  const gid = 'synthfm-grad'
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="SYNTH.FM" role="img">
        <defs>
          <linearGradient id={gid} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9d4edd" />
            <stop offset="0.55" stopColor="#e0509f" />
            <stop offset="1" stopColor="#ff7a59" />
          </linearGradient>
          <clipPath id="sun-clip"><circle cx="24" cy="22" r="11" /></clipPath>
        </defs>

        {/* rounded badge */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#100e18" stroke="url(#synthfm-grad)" strokeWidth="1.5" />

        {/* sun disc + horizontal slits in its lower half */}
        <g clipPath="url(#sun-clip)">
          <circle cx="24" cy="22" r="11" fill="url(#synthfm-grad)" />
          <g stroke="#100e18" strokeWidth="1.6">
            <line x1="13" y1="23" x2="35" y2="23" />
            <line x1="13" y1="26" x2="35" y2="26" />
            <line x1="13" y1="29.5" x2="35" y2="29.5" />
            <line x1="13" y1="33.5" x2="35" y2="33.5" />
          </g>
        </g>

        {/* soundwave baseline */}
        <g stroke="url(#synthfm-grad)" strokeWidth="2.4" strokeLinecap="round">
          <line x1="11" y1="39" x2="11" y2="37" />
          <line x1="16" y1="39" x2="16" y2="34" />
          <line x1="21" y1="39" x2="21" y2="38" />
          <line x1="27" y1="39" x2="27" y2="33" />
          <line x1="32" y1="39" x2="32" y2="36" />
          <line x1="37" y1="39" x2="37" y2="38" />
        </g>
      </svg>
      {withText && (
        <span className="topbar__logo-text">
          <span className="topbar__logo-synth">SYNTH</span><span className="topbar__logo-fm">.FM</span>
        </span>
      )}
    </span>
  )
}
