/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
        mint: 'var(--color-mint)',
        'mint-dark': 'var(--color-mint-dark)',
        'textbox-bg': 'var(--color-textbox-bg)',
        'textbox-text': 'var(--color-textbox-text)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        'kakao-bg': 'var(--kakao-bg)',
        'kakao-bubble-self': 'var(--kakao-bubble-self)',
        'kakao-bubble-other': 'var(--kakao-bubble-other)',
        'kakao-timestamp': 'var(--kakao-timestamp)',
      },
      fontFamily: {
        main: ['Pretendard', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
