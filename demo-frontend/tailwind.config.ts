import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f5f5f5',
                    100: '#ebebeb',
                    200: '#d3d3d3',
                    300: '#7d7d7d',
                    400: '#4b4b4b',
                    500: '#2f2f2f',
                    600: '#151515',
                },
                warning: {
                    500: '#db8c98',
                }
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
} satisfies Config 