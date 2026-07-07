'use client';

import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/HomeSections';
import { api, District, Constituency } from '@/lib/api';
import { Mic, MicOff, Camera, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';

const ESSENTIAL_THEMES = ['Water Supply', 'Healthcare', 'WATER_SUPPLY', 'HEALTHCARE'];

export default function SubmitPage() {
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ theme?: { name: string }; sentiment?: string; aiSummary?: string } | null>(null);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Location not supported. Please type your village name below.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLatLng({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const addr = data.address || {};
          const place = addr.village || addr.town || addr.city || addr.county || '';
          setLocationName(place);
        } catch {
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => {
        alert('Could not find location. Please type your area name.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const startRecording = () => {
    const SpeechRecognitionCtor = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert('Voice typing not supported. Please type your feedback.');
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = content ? content + ' ' : '';
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interim += t;
      }
      setContent((finalText + interim).trim());
    };
    recognition.onend = () => setRecording(false);
    recognition.start();
    speechRecognition.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    speechRecognition.current?.stop();
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
    if (latLng) {
      formData.append('latitude', String(latLng.lat));
      formData.append('longitude', String(latLng.lng));
    }
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
        <h1 className="text-3xl font-bold mb-2">Tell Us What Your Area Needs</h1>
        <p className="text-slate-600 mb-8">
          Speak, type, or take a photo in any language. We will send it to your MP.
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
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 font-medium"
            >
              {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
              {locating ? 'Finding your location...' : 'Find My Location'}
            </button>

            <div>
              <label className="block text-sm font-medium mb-2">Write your problem here</label>
              <p className="text-xs text-slate-500 mb-2">Example: &quot;No clean water for 3 days&quot; or &quot;Road has big holes&quot;</p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the issue in your language..."
                className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium ${recording ? 'border-red-500 text-red-600 bg-red-50' : 'border-slate-300 hover:bg-slate-50'}`}
              >
                {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {recording ? 'Stop Speaking' : 'Tap to Speak'}
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 font-medium"
              >
                <Camera className="w-5 h-5" />
                Take a Photo
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
              />
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

            <button type="submit" disabled={submitting || (!content && files.length === 0)} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? 'Sending...' : 'Send to MP Office'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
