/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─────────────────────────────────────────────
      // 🎨 PALETA DE MARCA — Mundo Maquillaje
      // Edita estos valores para cambiar los colores
      // en toda la aplicación.
      // ─────────────────────────────────────────────
      colors: {
        brand: {
          // Rosa principal
          50: "#FCE8ED",
          100: "#F6B6C6",
          200: "#F193AA",
          300: "#EB6283",   // rosa claro (fondos, bordes)
          400: "#E7446B",   // rosa medio (gradientes)
          500: "#E11546",   // rosa base (botones, CTA)
          600: "#CD1340",   // rosa oscuro (hover)
          700: "#A00F32",   // rosa profundo (active)
          800: "#7C0C27",
          900: "#5F091D",
        },
        neutral: {
          50: "#FFFAFB",
          100: "#FEF0F3",
          200: "#FEE8EE",
          300: "#FDCED9",
          400: "#E6BBC5",
          500: "#B4929A",
          600: "#8B7177",
          700: "#6A575B",
          800: "#222222",
          900: "#000000",
        },
        surface: {
          DEFAULT: "#FEF0F3",  // fondo páginas auth
          card: "#ffffff",  // fondo tarjetas
        },
        text: {
          base: "#1a1a2e",  // títulos
          muted: "#6A575B",  // subtítulos / placeholders
          link: "#ec4899",  // links
        },
      },

      // ─────────────────────────────────────────────
      // 🔤 TIPOGRAFÍA (Poppins)
      // ─────────────────────────────────────────────
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      fontSize: {
        // [fontSize, lineHeight]
        "h1-s": ["29px", "1.28"],
        "h1-b": ["80px", "1.28"],
        "h2-s": ["22px", "1.28"],
        "h2-b": ["64px", "1.28"],
        "h3-s": ["19px", "1.28"],
        "h3-b": ["48px", "1.28"],
        "h4-s": ["16px", "1.28"],
        "h4-b": ["28px", "1.28"],
        "h5-s": ["16px", "1.28"],
        "h5-b": ["20px", "1.28"],
        "p-s": ["14px", "normal"],
        "p-b": ["16px", "1.5"], // 150% line height
      },

      // ─────────────────────────────────────────────
      // 🎞️ ANIMACIONES PERSONALIZADAS
      // ─────────────────────────────────────────────
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "float-y": "floatY 3s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.45s ease forwards",
        "slide-in-left": "slideInLeft 0.45s ease forwards",
        "fade-in": "fadeIn 0.35s ease forwards",
      },

      // ─────────────────────────────────────────────
      // 📐 RADIOS / SOMBRAS EXTRA
      // ─────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem",
      },
      boxShadow: {
        brand: "0 4px 14px rgba(236,72,153,0.35)",
        "brand-lg": "0 6px 20px rgba(236,72,153,0.45)",
        "card-custom": "4px 4px 14px 0px rgba(93, 93, 93, 0.25)",
      },
    },
  },
  plugins: [],
};
