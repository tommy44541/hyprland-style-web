/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
			animation: {
        'page-transition-leave': 'page-transition-leave .5s ease-in-out forwards',
     		'page-transition-enter': 'page-transition-enter .5s ease-in-out forwards',
				'page-transition-leave-reverse': 'page-transition-leave-reverse .5s ease-in-out forwards',
				'page-transition-enter-reverse': 'page-transition-enter-reverse .5s ease-in-out forwards',
				'glitch-1': 'glitch-animation-1 2s linear infinite reverse alternate',
        'glitch-2': 'glitch-animation-2 2s linear infinite reverse alternate',
      },
			keyframes: {
				'page-transition-leave': {
					'0%': {
						transform: ' translateY(0)',
						opacity: '1',
					},
					'50%': {
						transform: ' translateY(-2rem)',
						opacity: '0',
					},
					'100%': {
						transform: ' translateY(2rem)',
						opacity: '0',
					},
				},
				'page-transition-enter': {
					'0%': {
						transform: ' translateY(2rem)',
						opacity: '0',
					},
					'100%': {
						transform: ' translateY(0rem)',
						opacity: '1',
					},
				},
				'page-transition-leave-reverse': {
					'0%': {
						transform: 'translateY(0)',
						opacity: '1',
					},
					'50%': {
						transform: 'translateY(2rem)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateY(-2rem)',
						opacity: '0',
					},
				},
				'page-transition-enter-reverse': {
					'0%': {
						transform: ' translateY(-2rem)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1',
					},
				},
				'glitch-animation-1': {
          ...Array.from({ length: 20 }, (_, i) => ({
            [`${(i / 20) * 100}%`]: {
              clip: `rect(${Math.random() * 150}px, 350px, ${Math.random() * 150}px, 30px)`,
            },
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        },
        'glitch-animation-2': {
          ...Array.from({ length: 20 }, (_, i) => ({
            [`${(i / 20) * 100}%`]: {
              clip: `rect(${Math.random() * 150}px, 350px, ${Math.random() * 150}px, 30px)`,
            },
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        },
			},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'light-nier': "url('/nier_light.png')",
				'dark-nier': "url('/nier_dark.png')",
  		},
  		zIndex: {
				main: '90',
  			navbar: '100',
  			overlay: '110',
  			sidebar: '120',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
			textColor: {
				nierDark: '#57544a',
				nierLight: '#b4af9a',
			},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
				nierDark: '#57544a',
				nierLight: '#b4af9a',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
