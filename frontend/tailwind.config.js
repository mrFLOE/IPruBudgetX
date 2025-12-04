module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        accent: {
          50: '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc2c2',
          300: '#ffa3a3',
          400: '#ff8585',
          500: '#ff6666',
          600: '#cc5252',
          700: '#993d3d',
          800: '#662929',
          900: '#331414',
        },
      },
    },
  },
  plugins: [],
}
