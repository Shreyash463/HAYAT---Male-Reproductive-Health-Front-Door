import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="space-y-3">
        <div className="h-6 w-36 rounded-full shimmer-skeleton" />
        <div className="h-10 w-3/4 max-w-lg rounded-2xl shimmer-skeleton" />
        <div className="h-5 w-1/2 max-w-md rounded-xl shimmer-skeleton" />
      </div>

      <div className="paper-card p-8 space-y-4">
        <div className="h-6 w-1/3 rounded-xl shimmer-skeleton" />
        <div className="h-4 w-full rounded-lg shimmer-skeleton" />
        <div className="h-4 w-5/6 rounded-lg shimmer-skeleton" />
        <div className="grid sm:grid-cols-2 gap-4 pt-3">
          <div className="h-28 rounded-2xl shimmer-skeleton" />
          <div className="h-28 rounded-2xl shimmer-skeleton" />
        </div>
      </div>
    </div>
  );
};
