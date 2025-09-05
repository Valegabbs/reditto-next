import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 24, text = 'Carregando...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 size={size} className="animate-spin text-purple-500 mb-4" />
      <p className="text-gray-300 text-sm">{text}</p>
    </div>
  );
}
