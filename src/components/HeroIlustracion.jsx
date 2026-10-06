export default function HeroIlustracion() {
  return (
    <svg
      className="hero-illustration"
      viewBox="0 0 480 300"
      role="img"
      aria-label="Ilustración de salmones nadando en el mar"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="salmonGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb9a3" />
          <stop offset="1" stopColor="#ff6f61" />
        </linearGradient>

        <symbol id="pez" viewBox="0 0 140 44">
          <path
            d="M2 22 C 28 -2, 84 -2, 110 22 C 84 46, 28 46, 2 22 Z"
            fill="url(#salmonGradient)"
          />
          <path d="M104 22 L138 4 L130 22 L138 40 Z" fill="#ff6f61" />
          <path
            d="M10 26 C 40 36, 80 36, 104 24"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="18" r="2.6" fill="#0b2545" />
        </symbol>
      </defs>

      {/* Burbujas */}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.5">
        <circle cx="70" cy="40" r="6" />
        <circle cx="92" cy="22" r="3.5" />
        <circle cx="400" cy="46" r="7" />
        <circle cx="425" cy="24" r="4" />
        <circle cx="240" cy="30" r="4.5" />
      </g>

      {/* Peces */}
      <g className="flota flota-1">
        <g transform="translate(60 78)">
          <use href="#pez" width="150" height="47" />
        </g>
      </g>
      <g className="flota flota-2">
        <g transform="translate(430 128) scale(-1 1)">
          <use href="#pez" width="190" height="60" />
        </g>
      </g>
      <g className="flota flota-3">
        <g transform="translate(130 168)">
          <use href="#pez" width="100" height="31" />
        </g>
      </g>

      {/* Olas */}
      <path
        d="M0 220 C 60 200, 120 240, 180 220 S 300 200, 360 220 S 440 240, 480 225 L480 300 L0 300 Z"
        fill="#ffffff"
        fillOpacity="0.08"
      />
      <path
        d="M0 245 C 80 225, 140 265, 220 245 S 360 225, 480 250 L480 300 L0 300 Z"
        fill="#ffffff"
        fillOpacity="0.12"
      />
      <path
        d="M0 270 C 90 255, 170 285, 260 268 S 400 255, 480 275 L480 300 L0 300 Z"
        fill="#ffffff"
        fillOpacity="0.18"
      />
    </svg>
  );
}