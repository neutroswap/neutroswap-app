/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "@apply text-neutral-800 dark:text-neutral-200 text-lg sm:text-[1.375rem] !important": "",
            p: {
              "@apply leading-9 text-lg !important": "",
            },
            strong: {
              "@apply text-neutral-800 dark:text-neutral-100 !important": "",
            },
            h1: {
              "@apply -mb-3 sm:-mb-2 !important": "",
              "@apply text-neutral-800 dark:!text-neutral-200 text-3xl sm:text-[2.625rem] leading-10 sm:leading-[3.125rem] font-extrabold tracking-[-.04em] !important": "",
            },
            h2: {
              letterSpacing: "0.5rem !important",
              "@apply flex items-center mb-2 !important": "",
              "@apply text-neutral-500 dark:text-neutral-400/60 text-sm sm:text-lg tracking-wide uppercase font-semibold !important": "",
              "@apply after:content-[''] !important": "",
            },
            'h2::after': {
              backgroundSize: "5px 1px !important",
              "@apply bg-gradient-to-r from-neutral-500 dark:from-neutral-600 via-transparent to-transparent bg-center bg-repeat-x !important": "",
              "@apply flex-1 mx-2 h-[2px]": ""
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
