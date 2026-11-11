import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Testimonial Studio',
  subtitle = 'Create, customize, and export professional testimonial posters',
}) => {
  const { showAlert } = useModalStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1.5 rounded-full font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Vector & High-Res Engine</span>
          <span className="font-caveat text-base text-amber-700 font-bold ml-1">~ 300 DPI</span>
        </div>

        <button
          title="Help & Reference Guide"
          onClick={() =>
            showAlert({
              title: 'Testimonial Studio Guide',
              message:
                '1. Select any of the 3 reference templates.\n2. Customize text, logos, photographs, and signatures.\n3. Click any element on the canvas or tweak properties in the right panel.\n4. Export in crisp PNG, JPG, or High-Resolution PDF.',
              confirmLabel: 'Got it',
              variant: 'info',
            })
          }
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

