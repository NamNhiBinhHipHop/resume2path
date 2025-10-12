'use client';

import { useState } from 'react';
import AnalysisView from '@/components/AnalysisView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type AnyRecord = Record<string, any>;

export default function AnalysisTemplatePage() {
  const [jsonText, setJsonText] = useState('');
  const [analysis, setAnalysis] = useState<AnyRecord | null>(null);
  const [parseMeta, setParseMeta] = useState<AnyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonText);
      // Accept either { analysis, parse } or a plain analysis object
      if (parsed && typeof parsed === 'object') {
        if (parsed.analysis || parsed.result) {
          setAnalysis(parsed.analysis || parsed.result);
          setParseMeta(parsed.parse || parsed.parseMeta || null);
        } else {
          setAnalysis(parsed);
          setParseMeta(parsed.parse || null);
        }
      } else {
        setError('Invalid JSON structure');
      }
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paste Your Analysis JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`{
  "role": "Software Developer",
  "skills": { "hard": ["JavaScript", "React"], "soft": ["Teamwork"] },
  "gaps": [ { "skill": "System Design" } ],
  "suggestions": [ { "title": "Quantify achievements", "description": "Add metrics" } ],
  "fit": { "score": 7 },
  "tracks": [ { "title": "Career Development Session", "ctaUrl": "https://calendly.com/your-mentor/intro" } ],
  "parse": { "parser": "pdf-parse", "pages": 1, "textLength": 1200, "file": { "name": "resume.pdf" } }
}`}
              className="min-h-[280px]"
            />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}
            <Button onClick={handlePreview} className="w-full">Preview</Button>
          </CardContent>
        </Card>

        <div>
          {analysis ? (
            <AnalysisView analysis={analysis} parseMeta={parseMeta} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Paste your analysis JSON on the left and click Preview.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


