import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Type as TypeIcon, Volume2, RotateCcw, Send, Loader2 } from 'lucide-react';
import type { CoachingEvaluation } from '../types/curriculum';

interface VoiceRecorderInputProps {
  lessonTitle: string;
  sciencePrinciple: string;
  briefing: string;
  prompt: string;
  targetCues: string[];
  modelExample: string;
  onEvaluated: (result: CoachingEvaluation, mode: 'voice' | 'text') => void;
}

export function VoiceRecorderInput({
  lessonTitle,
  sciencePrinciple,
  briefing,
  prompt,
  targetCues,
  modelExample,
  onEvaluated,
}: VoiceRecorderInputProps) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('audio/webm');
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [modelAudioUrl, setModelAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Microphone recording is unavailable in this browser. Switch to Text Mode below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ];
      const supportedType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setRecordedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setRecordedMimeType(mime);

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = String(reader.result || '');
          const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
          setRecordedBase64(base64);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedBase64(null);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setErrorMsg('Microphone permission was declined or unavailable. You can switch to Text Mode anytime.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const resetRecording = () => {
    setRecordedBase64(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setRecordingSeconds(0);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (mode === 'voice' && !recordedBase64) {
      setErrorMsg('Record a short spoken response first, or switch to Text Mode.');
      return;
    }
    if (mode === 'text' && textInput.trim().length < 5) {
      setErrorMsg('Type at least a full sentence so The Puh Coach can give accurate feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle,
          sciencePrinciple,
          briefing,
          prompt,
          targetCues,
          mode,
          userText: mode === 'text' ? textInput.trim() : undefined,
          audioBase64: mode === 'voice' ? recordedBase64 : undefined,
          audioMimeType: mode === 'voice' ? recordedMimeType : undefined,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Could not evaluate your response.');
      }

      onEvaluated(data as CoachingEvaluation, mode);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error evaluating response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayModel = async () => {
    setErrorMsg(null);
    if (modelAudioUrl) {
      const audio = new Audio(modelAudioUrl);
      audio.play();
      return;
    }

    setIsPlayingModel(true);
    try {
      const resp = await fetch('/api/coach/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: modelExample,
          style: 'Warm, relaxed, conversational confidence with natural pauses',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Unable to generate model voice.');
      }
      const dataUri = `data:audio/wav;base64,${data.audioBase64}`;
      setModelAudioUrl(dataUri);
      const audio = new Audio(dataUri);
      await audio.play();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to play model voice.');
    } finally {
      setIsPlayingModel(false);
    }
  };

  const formatSecs = (s: number) => `0:${String(s).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Segmented Mode Control (Interactive Filter Tabs Allowed) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('voice');
              setErrorMsg(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'voice'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Speak Aloud (Voice)
          </button>
          <button
            type="button"
            onClick={() => {
              if (isRecording) stopRecording();
              setMode('text');
              setErrorMsg(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'text'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            Write Response (Text)
          </button>
        </div>

        <button
          type="button"
          onClick={handlePlayModel}
          disabled={isPlayingModel}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
        >
          {isPlayingModel ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          Hear Model Delivery
        </button>
      </div>

      {mode === 'voice' ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
          {!recordedBase64 ? (
            <>
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 scale-105'
                      : 'duo-btn-emerald bg-emerald-600'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-7 h-7" />}
                </button>
                <div className="text-sm font-semibold text-slate-900">
                  {isRecording ? 'Recording your voice...' : 'Tap the microphone and speak naturally'}
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-500">
                  {formatSecs(recordingSeconds)} · Up to 1:00
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The Puh Coach hears your real words—including ums, speed, and pauses—and gives you street-smart, psych-backed feedback on how it lands.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-900">
                Voice Take Ready ({formatSecs(recordingSeconds)})
              </div>
              {recordedUrl && (
                <audio controls src={recordedUrl} className="w-full max-w-md mx-auto h-10" />
              )}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetRecording}
                  disabled={isSubmitting}
                  className="duo-btn-slate inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-record
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="duo-btn-emerald inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Voice...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Get Personalized Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            maxLength={1800}
            placeholder="Write exactly what you would say out loud in this moment..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {textInput.length} / 1800 chars
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || textInput.trim().length < 5}
              className="duo-btn-emerald inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluating Response...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Check Spoken Draft
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800"
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}
