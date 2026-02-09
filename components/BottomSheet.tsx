'use client';

import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  centered?: boolean; // Nova prop para modal centralizado
}

export default function BottomSheet({ isOpen, onClose, children, title, centered = false }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Modal - Centralizado ou Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bg-white shadow-2xl z-50 overflow-hidden transition-all duration-300 md:hidden ${
          centered
            ? 'inset-0 m-auto rounded-2xl w-[90%] max-w-md h-fit max-h-[80vh]'
            : 'bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh]'
        }`}
        style={
          centered
            ? {
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'scale(1)' : 'scale(0.9)',
              }
            : {
                transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
              }
        }
      >
        {/* Handle bar - só para bottom sheet */}
        {!centered && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="px-4 pb-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto scrollbar-hide p-4 ${
          centered ? 'max-h-[calc(80vh-80px)]' : 'max-h-[calc(85vh-80px)]'
        }`}>
          {children}
        </div>
      </div>
    </>
  );
}
