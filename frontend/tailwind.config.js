/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.ts", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        void: "#050510",
        panel: "#0B1020",
        cyan: "#22D3EE",
        magenta: "#F472B6",
        lime: "#A3E635",
        amber: "#FBBF24",
        mist: "#C7D2FE",
      },
    },
  },
  plugins: [],
};
