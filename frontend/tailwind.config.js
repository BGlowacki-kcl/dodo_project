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
        heading: "2rem", // Main headings, section titles, etc.
        medium: "1rem", // Paragraphs, general content, etc.
        small: "0.75rem", // Less prominent info, captions, secondary text, etc.
      }
    }
  },
  plugins: [],
}