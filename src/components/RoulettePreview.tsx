type Content = Record<
  string,
  {
    labels: JSX.Element;
    buttonText: string;
  }
>;

// prettier-ignore
const content: Content = {
  es: {
    labels: (
      <>
        <text transform="translate(312 135) rotate(90)" style={{ whiteSpace: "pre" }}>
          <tspan x="5" y="10">Sopa de</tspan>
          <tspan x="16" y="27">pollo</tspan>
        </text>
        <text transform="translate(246 45) rotate(45)">
          <tspan x="2" y="19">Ensalada</tspan>
        </text>
        <text transform="translate(136 28)" fontSize="16" fontWeight="900">
          <tspan x="12" y="20">At&#xfa;n</tspan>
        </text>
        <text transform="translate(45 93) rotate(-45)">
          <tspan x="10" y="19">Pozole</tspan>
        </text>
        <text transform="translate(28 204) rotate(-90)">
          <tspan x="12" y="10">Chiles</tspan>
          <tspan x="6" y="27">rellenos</tspan>
        </text>
        <text transform="translate(94 294) rotate(-135)">
          <tspan x="13" y="10">Carne</tspan>
          <tspan x="13" y="27">asada</tspan>
        </text>
        <text transform="translate(204 311) rotate(180)">
          <tspan x="1" y="19">Pollo frito</tspan>
        </text>
        <text transform="translate(294 245) rotate(135)">
          <tspan x="15" y="19">Pizza</tspan>
        </text>
      </>
    ),
    buttonText: "¡Decide!",
  },
  en: {
    labels: (
      <>
        <text transform="translate(312 135) rotate(90)">
          <tspan x="5" y="2">Chicken</tspan>
          <tspan x="9" y="19">Noodle</tspan>
          <tspan x="16" y="36">Soup</tspan>
        </text>
        <text transform="translate(246 45) rotate(45)">
          <tspan x="5" y="10">Chinese</tspan>
          <tspan x="6" y="27">Takeout</tspan>
        </text>
        <text transform="translate(136 28)" fontSize="16" fontWeight="900">
          <tspan x="12" y="10">Tuna</tspan>
          <tspan x="10" y="30">Salad</tspan>
        </text>
        <text transform="translate(45 93) rotate(-45)" fontSize="13">
          <tspan x="2" y="3">Spaghetti</tspan>
          <tspan x="29" y="19">
            &#38;
          </tspan>
          <tspan x="2" y="35">Meatballs</tspan>
        </text>
        <text transform="translate(28 204) rotate(-90)">
          <tspan x="7" y="19">Salmon</tspan>
        </text>
        <text transform="translate(94 294) rotate(-135)">
          <tspan x="8" y="19">
            Stir-Fry
          </tspan>
        </text>
        <text transform="translate(204 311) rotate(180)">
          <tspan x="16" y="10">Fried</tspan>
          <tspan x="5" y="27">Chicken</tspan>
        </text>
        <text transform="translate(294 245) rotate(135)">
          <tspan x="15" y="19">Pizza</tspan>
        </text>
      </>
    ),
    buttonText: "Choose!",
  },
};

const innerImage =
  "https://images.unsplash.com/photo-1612949060306-4c298ad7f34c?w=500&auto=format&fit=crop&q=60";

type Props = {
  lang: keyof typeof content;
};

export default function RoulettePreview({ lang }: Props) {
  const { labels, buttonText } = content[lang];

  // prettier-ignore
  return (
    <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <g filter="url(#filter0)">
        <mask id="mask0" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="340" height="340">
          <circle cx="170" cy="170" r="170" fill="#EB5757" />
        </mask>
        <g mask="url(#mask0)">
          <path d="M170 170L252 -28L366 89L170 170Z" fill="#C026D3" />
          <path d="M170 170L252 -28L89 -26L170 170Z" fill="#7C3AED" />
          <path d="M170 170L-28 88L89 -26L170 170Z" fill="#2563EB" />
          <path d="M170 170L-28 88L-26 251L170 170Z" fill="#0891B2" />
          <path d="M170 170L88 368L-26 251L170 170Z" fill="#059669" />
          <path d="M170 170L88 368L252 366L170 170Z" fill="#65A30D" />
          <path d="M170 170L369 251L252 366L170 170Z" fill="#D97706" />
          <path d="M170 170L369 252L366 88L170 170Z" fill="#DC2626" />

          <g fontFamily="Montserrat" fill="white" fontWeight="300" letterSpacing="0em" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontSize="14">
            {labels}
          </g>

          <circle cx="170" cy="170" r="170" fill="url(#paint0)" stroke="#D1D5DB" strokeWidth="5" />
          <g filter="url(#filter1)">
            <path d="M170 161L302 302L170 443L38 302L170 161Z" fill="#1F2937" />
          </g>
          <circle cx="170" cy="170" r="93" fill="white" />
          <g filter="url(#filter2)">
            <mask id="mask1" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="80" y="80" width="180" height="181">
              <circle cx="170" cy="170" r="90" fill="#E0E0E0" />
            </mask>
            <g mask="url(#mask1)">
              <rect x="44" y="79" width="305" height="203" fill="url(#pattern0)" />
            </g>
          </g>
          <g filter="url(#filter3)">
            <rect x="127" y="277" width="87" height="37" rx="19" fill="#9CA3AF" />
            
            <text fill="#D1D5DB" xmlSpace="preserve" style={{ whiteSpace: "pre" }} fontFamily="Bangers" fontSize="20" letterSpacing="0em">
              <tspan x="142" y="302">
                {buttonText}
              </tspan>
            </text>

          </g>
        </g>
      </g>
      <g filter="url(#filter4)">
        <path d="M172 14C172 16 170 16 169 14L162 -2C162 -3 163 -5 164 -5L177 -5C178 -5 180 -3 179 -2L172 14Z" fill="#B91C1C" />
        <circle cx="171" cy="6" r="3" fill="#F3F4F6" />
      </g>
      <defs>
        <filter id="filter0" x="-20" y="0" width="380" height="380" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="5" operator="erode" in="SourceAlpha" result="effect1" />
          <feOffset dy="10" />
          <feGaussianBlur stdDeviation="5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="5" operator="erode" in="SourceAlpha" result="effect2" />
          <feOffset dy="20" />
          <feGaussianBlur stdDeviation="12" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="effect1" result="effect2" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2" result="shape" />
        </filter>
        <filter id="filter1" x="0" y="148" width="340" height="358" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="12" operator="erode" in="SourceAlpha" result="effect1" />
          <feOffset dy="25" />
          <feGaussianBlur stdDeviation="25" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
        <filter id="filter2" x="80" y="80" width="180" height="182" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="shape" result="effect1" />
        </filter>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0" transform="scale(0.00157233 0.00235849)" />
        </pattern>
        <filter id="filter3" x="88" y="263" width="163" height="113" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="12" operator="erode" in="SourceAlpha" result="effect1" />
          <feOffset dy="25" />
          <feGaussianBlur stdDeviation="25" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1" result="shape" />
        </filter>
        <filter id="filter4" x="157" y="-5" width="26" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect1" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect2" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
          <feBlend mode="normal" in2="effect1" result="effect2" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2" result="shape" />
        </filter>
        <radialGradient id="paint0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 170) rotate(90) scale(170)">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <image id="image0" width="636" height="424" xlinkHref={innerImage} />
      </defs>
    </svg>
  );
}
