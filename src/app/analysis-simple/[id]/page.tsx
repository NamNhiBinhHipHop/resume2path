'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AnalysisView from '@/components/AnalysisView';

type AnalysisResult = any;

export default function AnalysisPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [role, setRole] = useState<string>('General');
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [parseMeta, setParseMeta] = useState<any | null>(null);
  const [createdAtIso, setCreatedAtIso] = useState<string | null>(null);
  const [resumeMeta, setResumeMeta] = useState<{ fileUrl?: string; fileType?: string } | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Prefer sessionStorage (analysis saved right after upload)
        try {
          if (typeof window !== 'undefined') {
            const raw = sessionStorage.getItem(`analysis:${params.id}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              const res = parsed?.result?.result || parsed?.result || parsed;
              if (res) {
                setAnalysis(res);
                setRole(res?.role || 'General');
                const fs = typeof res?.fit === 'number' ? res.fit : (typeof res?.fit?.score === 'number' ? res.fit.score : null);
                setFitScore(fs);
                setParseMeta(res?.parse || null);
                setCreatedAtIso(parsed?.createdAt || null);
                setResumeMeta(parsed?.resume || null);
                setLoading(false);
                return;
              }
            }
          }
        } catch {}

        const response = await fetch(`/api/analysis-simple/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const res = data.result?.result || data.result;
          setAnalysis(res);
          setRole(res?.role || data.result?.mentee?.targetRole || 'General');
          const fs = typeof res?.fit === 'number' ? res.fit : (typeof res?.fit?.score === 'number' ? res.fit.score : null);
          setFitScore(fs);
          setParseMeta(res?.parse || null);
          setCreatedAtIso(data.result?.createdAt || null);
          setResumeMeta({ fileUrl: data.result?.resume?.fileUrl, fileType: data.result?.resume?.fileType });
        } else {
          console.error('Failed to fetch analysis');
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Analyzing your resume...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Analysis not found</p>
        </div>
      </div>
    );
  }

  return <AnalysisView analysis={analysis} parseMeta={parseMeta} />
}
