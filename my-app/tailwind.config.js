/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          backgroundApp: '#34495e',  
          buttonGreen: '#28b463',
          textWhile: '#FFFFFF',
          textBlack: '#000000',

      },
      },
    },
    plugins: [],
  }