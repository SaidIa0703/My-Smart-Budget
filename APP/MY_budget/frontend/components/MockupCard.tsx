import React from 'react';

interface MockupCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const MockupCard: React.FC<MockupCardProps> = ({ title, children, delay = 0 }) => {
  return (
    <div
      className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:-translate-y-4 animate-fadeInUp"
      style={{
        animationDelay: `${delay}s`,
        opacity: 0,
        animation: `fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s forwards`,
      }}
    >
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-7 text-white font-semibold text-lg flex items-center gap-3 tracking-tight">
        {title}
      </div>

      {/* Content */}
      <div className="h-[650px] overflow-hidden relative">
        {children}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fadeInUp) {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  );
};

export default MockupCard;
