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
      backgroundImage: {
        'hard-gradient-to-r': "linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-from) 50%, var(--tw-gradient-to) 50%, var(--tw-gradient-to))"
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "@apply text-neutral-800 dark:text-neutral-200 sm:text-[1.375rem] !important": "",
            p: {
              "@apply leading-9 text-lg !important": "",
            },
            ul: {
              "@apply leading-9 text-lg list-disc !important": "",
            },
            strong: {
              "@apply text-neutral-800 dark:text-neutral-100 !important": "",
            },
            h1: {
              "@apply -mb-3 sm:-mb-2 !important": "",
              "@apply text-neutral-800 dark:!text-neutral-200 text-3xl sm:text-3xl leading-none font-extrabold !important": "",
            },
            h2: {
              letterSpacing: "0.5rem !important",
              "@apply flex items-center mb-2 !important": "",
              "@apply text-neutral-500 dark:text-neutral-400/60 text-sm sm:text-lg tracking-wide uppercase font-semibold !important": "",
              "@apply after:content-[''] !important": "",
            },
            'h2::after': {
              backgroundSize: "12px 1px !important",
              "@apply bg-hard-gradient-to-r from-neutral-300 dark:from-neutral-400/25 via-transparent to-transparent bg-left bg-repeat-x !important": "",
              "@apply bg-left bg-repeat-x !important": "",
              "@apply flex-1 mx-2 h-[1px]": ""
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
