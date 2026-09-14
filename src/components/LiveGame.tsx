import React, { useState, useEffect, useRef } from 'react';
import { GameSettings } from '../types';
import { pcmToBase64, base64ToPcm } from '../lib/audioUtils';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';

interface Props {
  settings: GameSettings;
  onExit: () => void;
}

export default function LiveGame({ settings, onExit }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    let active = true;

    const startCall = async () => {
      try {
        // Initialize WS
        const wsUrl = new URL(`/live?personality=${encodeURIComponent(settings.personality)}&voice=${encodeURIComponent(settings.voice)}`, window.location.href);
        wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
        const ws = new WebSocket(wsUrl.toString());
        wsRef.current = ws;

        // Initialize Audio contexts
        const inputCtx = new window.AudioContext({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        const outputCtx = new window.AudioContext({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputCtx;
        nextStartTimeRef.current = 0;

        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const source = inputCtx.createMediaStreamSource(stream);
        sourceRef.current = source;

        // Use ScriptProcessor for capturing raw PCM
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };

        ws.onopen = () => {
          if (active) {
            setIsConnected(true);
            setIsConnecting(false);
          }
        };

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          
          if (msg.interrupted) {
            // Stop current playback and clear queue
            nextStartTimeRef.current = outputCtx.currentTime;
          }

          if (msg.audio) {
            const pcm = base64ToPcm(msg.audio);
            const buffer = outputCtx.createBuffer(1, pcm.length, 24000);
            buffer.getChannelData(0).set(pcm);

            const sourceNode = outputCtx.createBufferSource();
            sourceNode.buffer = buffer;
            sourceNode.connect(outputCtx.destination);
            
            const startT = Math.max(outputCtx.currentTime, nextStartTimeRef.current);
            sourceNode.start(startT);
            nextStartTimeRef.current = startT + buffer.duration;
          }
        };

        ws.onclose = () => {
          if (active) {
            setIsConnected(false);
            onExit();
          }
        };
      } catch (err) {
        console.error("Live call failed to start", err);
        if (active) {
          setIsConnecting(false);
          onExit();
        }
      }
    };

    startCall();

    return () => {
      active = false;
      if (wsRef.current) wsRef.current.close();
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      if (sourceRef.current) sourceRef.current.disconnect();
      if (processorRef.current) processorRef.current.disconnect();
      if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
      if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
    };
  }, [settings, onExit]);

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const endCall = () => {
    onExit();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      {isConnecting ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-lg">Connecting to your host...</p>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-48 h-48 rounded-full bg-slate-800 flex items-center justify-center mb-8 relative shadow-2xl">
            {/* Visual pulsing rings for active call */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-50 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-25 scale-110"></div>
            <div className="z-10 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Host</p>
              <p className="font-bold text-xl">{settings.voice}</p>
            </div>
          </div>
          
          <p className="text-slate-400 mb-12 text-center text-lg max-w-xs">
            Playing with a {settings.personality.toLowerCase()} personality
          </p>

          <div className="flex items-center gap-8">
            <button 
              onClick={toggleMic}
              className={`p-6 rounded-full transition-colors ${isMicMuted ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              {isMicMuted ? <MicOff className="w-8 h-8 text-slate-400" /> : <Mic className="w-8 h-8 text-slate-100" />}
            </button>

            <button 
              onClick={endCall}
              className="p-6 rounded-full bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/50"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
