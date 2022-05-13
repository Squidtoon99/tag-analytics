module.exports = {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      colors: {
        blue: {
          404: "#14213D",
        },
        grey: {
          404: "#E5E5E5",
        },
        orange: {
          404: "#FCA311",
        }
      }
    },
  },
  plugins: [],
}
