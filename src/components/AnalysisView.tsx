'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, CheckCircle, AlertCircle, Lightbulb, Calendar, ArrowRight } from 'lucide-react';

type AnyRecord = Record<string, any>;

export interface AnalysisViewProps {
  analysis: AnyRecord; // normalized or flexible structure
  parseMeta?: AnyRecord | null;
}

function getRole(analysis: AnyRecord): string {
  return (
    analysis?.role ||
    analysis?.mentee?.targetRole ||
    analysis?.targetRole ||
    'General'
  );
}

function getFitScore(analysis: AnyRecord): number | null {
  const fit = analysis?.fit;
  if (typeof fit === 'number') return fit;
  if (fit && typeof fit?.score === 'number') return fit.score;
  return null;
}

function getFitColor(fit: number | null): string {
  if (fit == null) return 'bg-gray-100 text-gray-700';
  if (fit >= 8) return 'bg-green-100 text-green-700';
  if (fit >= 5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function AnalysisView({ analysis, parseMeta }: AnalysisViewProps) {
  const role = getRole(analysis);
  const fitScore = getFitScore(analysis);
  const suggestions = analysis?.suggestions || [];
  const gaps = analysis?.gaps || [];
  // Support both shapes: { skills: { hard:[], soft:[] } } and { skills: Array<{name,rating,evidence}> }
  const hasSplitSkills = analysis?.skills && !Array.isArray(analysis.skills);
  const skillsHard = hasSplitSkills ? (analysis?.skills?.hard || []) : [];
  const skillsSoft = hasSplitSkills ? (analysis?.skills?.soft || []) : [];
  const skillsFlat: Array<{ name: string; rating?: number; evidence?: string }> = Array.isArray(analysis?.skills)
    ? analysis.skills
    : [];
  const experienceList: string[] = Array.isArray(analysis?.experience) ? analysis.experience : [];
  const summary: string | null = typeof analysis?.summary === 'string' ? analysis.summary : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Resume Analysis Results</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-200" />
              <span className="text-xl text-blue-100">Target Role: {role}</span>
            </div>
            <Badge className={`${getFitColor(fitScore)} text-lg px-4 py-2`}>
              {fitScore != null ? `Fit: ${fitScore}/10` : 'Fit: N/A'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Summary */}
        {summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
              <CardDescription>Brief overview from the analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {experienceList.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Experience</CardTitle>
              <CardDescription>Roles and highlights recognized by the analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {experienceList.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {/* Parse Summary */}
        {parseMeta && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Parsing Summary</CardTitle>
              <CardDescription>Details from file text extraction</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Parser:</span> {parseMeta.parser || 'n/a'}
              </div>
              {typeof parseMeta.pages === 'number' && (
                <div>
                  <span className="font-semibold">Pages:</span> {parseMeta.pages}
                </div>
              )}
              <div>
                <span className="font-semibold">Extracted Length:</span> {parseMeta.textLength ?? 'n/a'} chars
              </div>
              <div>
                <span className="font-semibold">File:</span> {parseMeta.file?.name || 'n/a'} ({parseMeta.file?.mime || parseMeta.file?.ext || 'n/a'})
              </div>
              {parseMeta.error && (
                <div className="sm:col-span-2 text-orange-700">
                  <span className="font-semibold">Note:</span> {parseMeta.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Current Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasSplitSkills ? (
                <>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Hard Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillsHard?.map?.((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      )) || <span className="text-gray-500">No hard skills identified</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillsSoft?.map?.((skill: string, index: number) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      )) || <span className="text-gray-500">No soft skills identified</span>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {skillsFlat.length > 0 ? (
                    skillsFlat.map((s, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-800">{s.name}</span>
                          {s.evidence && (
                            <p className="text-gray-600 text-xs mt-0.5">{s.evidence}</p>
                          )}
                        </div>
                        {typeof s.rating === 'number' && (
                          <Badge className="bg-blue-100 text-blue-700">{s.rating}/10</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No skills identified</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gaps Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Skills Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gaps?.map?.((gap: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-700">{typeof gap === 'string' ? gap : gap?.skill || 'Gap'}</span>
                  </div>
                )) || <span className="text-gray-500">No skill gaps identified</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>
              Specific recommendations to improve your resume for the target role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {suggestions?.map?.((suggestion: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-medium">{suggestion.section || suggestion.title || `Suggestion ${index+1}`}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <h5 className="font-semibold text-sm text-gray-700">Suggested Change:</h5>
                        <p className="text-gray-600">{suggestion.change || suggestion.description || '—'}</p>
                      </div>
                      {/**
                       * Reason section intentionally commented out per request.
                       * To restore, remove the comment wrapper below.
                       */}
                      {false && (
                        <div>
                          <h5 className="font-semibold text-sm text-gray-700">Reason:</h5>
                          <p className="text-gray-600">{suggestion.reason || suggestion.rationale || '—'}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )) || <div className="text-center py-8 text-gray-500">No specific suggestions available at this time.</div>}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-7 w-7" />
              Ready to Take Action?
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Book a 1-on-1 session with our career mentors to dive deeper into your analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-lg mb-3">{analysis.tracks?.[0]?.title || 'Career Development Session'}</h4>
                <p className="text-blue-100">Get personalized feedback on your resume and practice mock interviews</p>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-blue-600 hover:bg-blue-50 h-14 text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <a href={analysis.tracks?.[0]?.ctaUrl || 'https://calendly.com/your-mentor/intro'} target="_blank" rel="noopener noreferrer">
                  Book 1-on-1 Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


