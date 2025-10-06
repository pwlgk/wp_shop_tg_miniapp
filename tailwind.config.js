// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // --- 1. РАЗМЕРЫ КОНТЕЙНЕРА ---
    container: {
      center: true,
      padding: "1rem", // 16px (p-4) - базовый отступ по краям
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // --- 2. ЦВЕТА (у вас уже настроены) ---
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      // --- 3. СКРУГЛЕНИЯ ---
      borderRadius: {
        // Используем 2xl как основной
        lg: `var(--radius)`,     // 0.5rem (8px)
        DEFAULT: `var(--radius)`, // 0.5rem (8px)
        md: `calc(var(--radius) - 2px)`, // 6px
        sm: "calc(var(--radius) - 4px)", // 4px
        xl: `calc(var(--radius) + 4px)`, // 12px
        '2xl': `calc(var(--radius) * 2)`,   // 1rem (16px) - наш основной
        '3xl': `calc(var(--radius) * 3)`,   // 1.5rem (24px)
        full: "9999px",
      },
      // --- 4. РАЗМЕРЫ ШРИФТОВ (Типографическая шкала) ---
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],    // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],// 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],// 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],// 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      },
      // --- 5. ОТСТУПЫ (Spacing Scale) ---
      spacing: {
        'control-xs': '2rem',  // 32px (h-8) - маленькие кнопки
        'control-sm': '2.5rem',// 40px (h-10) - средние кнопки/инпуты
        'control-md': '3rem',  // 48px (h-12) - большие кнопки
        'control-lg': '3.5rem',// 56px (h-14) - очень большие кнопки
      },
      // --- 6. КАСТОМИЗАЦИЯ TYPOGRAPHY PLUGIN ---
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
			'h1, h2, h3, h4': {
              color: theme('colors.primary'),
            },
            // Можно также настроить цвет для жирного текста, если нужно
            'strong': {
              color: theme('colors.foreground'),
            },
			'span': {
              color: theme('colors.foreground'),
            },
            '--tw-prose-body': theme('colors.foreground / 80%'),
            '--tw-prose-headings': theme('colors.primary'),
            '--tw-prose-lead': theme('colors.foreground'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted.foreground'),
            '--tw-prose-bullets': theme('colors.primary'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-pre-code': theme('colors.foreground'),
            '--tw-prose-pre-bg': theme('colors.muted'),
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),

            // Убираем кавычки у цитат
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
          },
        },
      }),
      // --- Анимации ---
      keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar-hide"),
  ],
}