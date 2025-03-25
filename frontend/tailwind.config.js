/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        secondary: "#1B2A41", // Navbar, Sidebar, Buttons, entries, tags, etc.
        primary: "#ffffff", // Key Components, Boxes, etc.
        background: "#e0e0e0", // Background colour for all pages
        ltext: "#ffffff", 
        dtext: "#000000"
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"], // Set default font
        heading: ["Poppins", "sans-serif"], // Custom heading font
      },
      fontSize: {
        fontSize: {
          "4xl": "2.25rem", // Page headers (e.g., Job Details, Profile)
          "2xl": "1.5rem", // Section subheaders (e.g., Personal Information, My Applications)
          xl: "1.25rem", // Secondary subheaders (e.g., Questions, Code Assessment)
          base: "1rem", // Default text size (general content)
          sm: "0.875rem", // Smaller text (e.g., stat titles, captions)
          xs: "0.75rem", // Extra small text (e.g., secondary info, labels)
      },
      },
    }
  },
  plugins: [],
}