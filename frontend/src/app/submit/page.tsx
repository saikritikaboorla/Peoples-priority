'use client';

import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/HomeSections';
import { api, District, Constituency } from '@/lib/api';
import { Mic, MicOff, Upload, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function SubmitPage() {
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ theme?: { name: string }; sentiment?: string; aiSummary?: string } | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    api.getConstituencies().then(setConstituencies).catch(console.error);
  }, []);

  useEffect(() => {
    if (constituencyId) {
      api.getDistricts(constituencyId).then(setDistricts).catch(console.error);
    }
  }, [constituencyId]);

  useEffect(() => {
    if (constituencies.length === 1) {
      setConstituencyId(constituencies[0].id);
    }
  }, [constituencies]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setFiles((prev) => [...prev, new File([blob], 'voice-recording.webm', { type: 'audio/webm' })]);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && files.length === 0) return;

    setSubmitting(true);
    const formData = new FormData();
    if (content) formData.append('rawContent', content);
    formData.append('channel', 'WEB');
    formData.append('isAnonymous', 'true');
    if (districtId) formData.append('districtId', districtId);
    if (constituencyId) formData.append('constituencyId', constituencyId);
    if (locationName) formData.append('locationName', locationName);
    files.forEach((f) => formData.append('files', f));

    try {
      const res = await api.submitFeedback(formData);
      setResult(res);
      setSuccess(true);
      setContent('');
      setFiles([]);
    } catch {
      alert('Submission failed. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Submit Development Feedback</h1>
        <p className="text-slate-600 mb-8">
          Share your suggestion in any language — text, voice, or photo. AI will classify and route it to your MP.
        </p>

        {success ? (
          <div className="card text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Feedback Submitted!</h2>
            {result?.theme && (
              <p className="text-slate-600 mb-2">Classified as: <strong>{result.theme.name}</strong></p>
            )}
            {result?.sentiment && (
              <p className="text-slate-600 mb-2">Sentiment: <strong>{result.sentiment}</strong></p>
            )}
            {result?.aiSummary && (
              <p className="text-sm text-slate-500 mb-4">{result.aiSummary}</p>
            )}
            <button onClick={() => { setSuccess(false); setResult(null); }} className="btn-primary">
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Feedback</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the development need in your area... (Hindi, English, or any Indian language)"
                className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${recording ? 'border-red-500 text-red-600 bg-red-50' : 'border-slate-300 hover:bg-slate-50'}`}
              >
                {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {recording ? 'Stop Recording' : 'Record Voice'}
              </button>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*,audio/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="text-sm text-slate-600">
                Attached: {files.map((f) => f.name).join(', ')}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Constituency</label>
                <select
                  value={constituencyId}
                  onChange={(e) => setConstituencyId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="">Select constituency</option>
                  {constituencies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">District</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="">Select district</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location (optional)
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Village or locality name"
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>

            <button type="submit" disabled={submitting || (!content && files.length === 0)} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? 'Processing with AI...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
