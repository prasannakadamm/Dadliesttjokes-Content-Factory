import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        foreground: '#f0f0f5',
        primary: '#4ade80',
        card: '#16161e',
        border: '#2a2a38',
        muted: '#8e8ea0',
      },
    },
  },
  plugins: [],
};

export default config;
