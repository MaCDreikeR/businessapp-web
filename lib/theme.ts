/**
 * Sistema de Design - BusinessApp Web
 * 
 * Cores centralizadas baseadas no app mobile
 * Importado de: BusinessApp/utils/theme.ts
 */

export const colors = {
  // Cores Primárias - Roxo/Violeta (marca BusinessApp)
  primary: '#7C3AED',           // Violeta 600
  primaryDark: '#6D28D9',       // Violeta 700
  primaryLight: '#A855F7',      // Violeta 500
  primaryLighter: '#C084FC',    // Violeta 400
  
  // Cores Secundárias - Verde
  secondary: '#10B981',         // Verde Esmeralda
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Cores de Sucesso/Erro/Aviso
  success: '#34C759',
  successLight: '#8AFFB0',
  successDark: '#248A3D',
  
  error: '#FF3B30',
  errorLight: '#FF6961',
  errorDark: '#C41E17',
  
  warning: '#FF9500',
  warningLight: '#FFB340',
  warningDark: '#C77700',
  
  info: '#5AC8FA',
  infoLight: '#8FD9FF',
  infoDark: '#2B9BD6',
  
  // Cores Neutras
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// Classes Tailwind para usar com as cores (para casos onde precisar de utility classes)
export const colorClasses = {
  primary: {
    bg: 'bg-[#7C3AED]',
    bgHover: 'hover:bg-[#6D28D9]',
    text: 'text-[#7C3AED]',
    border: 'border-[#7C3AED]',
    ring: 'ring-[#7C3AED]',
  },
  secondary: {
    bg: 'bg-[#10B981]',
    bgHover: 'hover:bg-[#059669]',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]',
    ring: 'ring-[#10B981]',
  },
} as const;

// Gradientes
export const gradients = {
  primary: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
  primaryReverse: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
} as const;
