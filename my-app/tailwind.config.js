/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          backgroundApp: '#34495e',  
          buttonColors: '#28b463'
      },
      },
    },
    plugins: [],
  }