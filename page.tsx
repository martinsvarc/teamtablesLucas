src\app\embed\team-tables\page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';  // Add useState and useEffect
import { ErrorBoundary } from 'react-error-boundary';
import { ActivityView } from "@/components/custom/activity-view"
import { CallLogsView } from "@/components/custom/call-logs-view"

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
      <pre className="mt-2 text-sm text-gray-500">{error.message}</pre>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b06be]"></div>
    </div>
  );
}

export default function TeamTablesPage() {
  const [params, setParams] = useState<{ teamId?: string; memberId?: string }>({});
  
  useEffect(() => {
    // Get URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || undefined;
    const memberId = searchParams.get('memberId') || undefined;
    
    setParams({ teamId, memberId });
  }, []);

  const handleError = (error: Error) => {
    console.error('Error in TeamTables:', error);
  };
 
  return (
    <div className="w-full max-w-full p-0 m-0 bg-[#f2f3f8]">
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <Suspense fallback={<LoadingFallback />}>
          <div className="w-full max-w-full p-0 m-0 flex flex-col gap-3 bg-[#f2f3f8]">
            <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
              <ActivityView />
            </ErrorBoundary>
            <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
              {params.teamId && params.memberId ? (
                <CallLogsView teamId={params.teamId} memberId={params.memberId} />
              ) : (
                <div className="text-center p-4">Loading parameters...</div>
              )}
            </ErrorBoundary>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
