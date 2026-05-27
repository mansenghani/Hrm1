import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const normalized = path.replace(/\\/g, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const Avatar = ({ name, image, size = 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-4xl' : 'w-14 h-14 text-xl';
  if (image) {
    return (
      <img
        src={getImageUrl(image)}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-4 border-white/30 shadow-xl`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white border-4 border-white/30 shadow-xl`}>
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
};

/**
 * CallManager — real-time WebRTC voice/video calling.
 *
 * Props:
 *   socket            — the live socket.io instance (React state from Chat.jsx)
 *   currentUserId     — logged-in user's _id
 *   currentUserName   — logged-in user's display name
 *   currentUserImage  — logged-in user's profile image path
 *   children          — renders Chat content underneath
 */
const CallManager = ({ socket, currentUserId, currentUserName, currentUserImage, onCallEvent, children }) => {
  // ── Call state machine ──
  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | active
  const [callType, setCallType] = useState('voice');  // voice | video
  const [remoteUser, setRemoteUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingData, setIncomingData] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [callError, setCallError] = useState('');

  // ── Refs (not re-renders) ──
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const timerRef = useRef(null);
  const pendingCandidates = useRef([]);
  const remoteDescSet = useRef(false);
  const callStateRef = useRef('idle'); // shadow for use inside socket callbacks
  const initiatorRef = useRef(false);
  const activeCallRef = useRef(null);
  const endLoggedRef = useRef(false);
  const durationRef = useRef(0);

  // Keep callStateRef in sync with callState
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const attachStream = useCallback((videoElement, stream) => {
    if (!videoElement || !stream) return;
    videoElement.srcObject = stream;
    const playPromise = videoElement.play();
    playPromise?.catch?.(() => {});
  }, []);

  // ─────────────────────────────────────
  //  CLEANUP
  // ─────────────────────────────────────
  const cleanup = useCallback(() => {
    callStateRef.current = 'idle';
    if (timerRef.current) clearInterval(timerRef.current);
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    pendingCandidates.current = [];
    remoteDescSet.current = false;
    durationRef.current = 0;
    setCallState('idle');
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsSpeakerOff(false);
    setRemoteUser(null);
    setIncomingData(null);
    setIsAccepting(false);
    setCallError('');
  }, []);

  const logCallEnd = useCallback(() => {
    if (initiatorRef.current && callStateRef.current === 'active' && !endLoggedRef.current) {
      endLoggedRef.current = true;
      onCallEvent?.({
        status: 'ended',
        callType: activeCallRef.current?.type || 'voice',
        duration: durationRef.current,
      });
    }
  }, [onCallEvent]);

  // ─────────────────────────────────────
  //  CREATE RTCPeerConnection
  // ─────────────────────────────────────
  const createPC = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket) {
        socket.emit('call:ice-candidate', { to: targetUserId, candidate });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0] || new MediaStream([event.track]);
      if (remoteVideoRef.current) {
        attachStream(remoteVideoRef.current, remoteStreamRef.current);
      }
    };

    return pc;
  }, [socket, attachStream]);

  // ─────────────────────────────────────
  //  START CALL  (called by Chat via window.__startCall)
  // ─────────────────────────────────────
  const startCall = useCallback(async (targetUser, type = 'voice') => {
    if (!socket) {
      alert('Connection not ready. Please wait a moment and try again.');
      return;
    }
    if (callStateRef.current !== 'idle') return;

    callStateRef.current = 'outgoing';
    initiatorRef.current = true;
    activeCallRef.current = { user: targetUser, type };
    endLoggedRef.current = false;
    setCallError('');
    setCallType(type);
    setRemoteUser(targetUser);
    setCallState('outgoing');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        attachStream(localVideoRef.current, stream);
      }

      const pc = createPC(targetUser.id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:offer', {
        to: targetUser.id,
        from: currentUserId,
        offer,
        callType: type,
        callerName: currentUserName,
        callerImage: currentUserImage,
      });

    } catch (err) {
      console.error('[Call] Failed to start call:', err);
      cleanup();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Microphone/Camera permission denied. Please allow access in your browser settings.');
      }
    }
  }, [socket, createPC, currentUserId, currentUserName, currentUserImage, cleanup, attachStream]);

  // Expose startCall globally so Chat.jsx buttons can trigger it
  useEffect(() => {
    window.__startCall = startCall;
    return () => { delete window.__startCall; };
  }, [startCall]);

  // Video elements are conditionally rendered, so streams may exist before refs do.
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      attachStream(localVideoRef.current, localStreamRef.current);
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      attachStream(remoteVideoRef.current, remoteStreamRef.current);
    }
  }, [callState, callType, attachStream]);

  // ─────────────────────────────────────
  //  ACCEPT CALL
  // ─────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!incomingData || !socket || isAccepting) return;

    const { from, offer, callType: type, callerName, callerImage } = incomingData;
    setIsAccepting(true);
    setCallError('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera and microphone are blocked on this page. Open the app using HTTPS or localhost, then try again.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;

      initiatorRef.current = false;
      activeCallRef.current = { user: { id: from, name: callerName, image: callerImage }, type };
      endLoggedRef.current = false;
      callStateRef.current = 'active';
      setCallType(type);
      setRemoteUser({ id: from, name: callerName, image: callerImage });
      setCallState('active');
      setIsAccepting(false);

      if (localVideoRef.current && type === 'video') {
        attachStream(localVideoRef.current, stream);
      }

      const pc = createPC(from);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      remoteDescSet.current = true;

      // Flush any ICE candidates that arrived early
      for (const c of pendingCandidates.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
      }
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call:answer', { to: from, answer });

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setCallDuration(durationRef.current);
      }, 1000);

    } catch (err) {
      console.error('[Call] Failed to accept call:', err);
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      remoteDescSet.current = false;
      setIsAccepting(false);
      setCallError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera or microphone permission was denied. Allow access in browser settings, then press Accept again.'
          : err.message || 'Could not start this call. Please try again.'
      );
    }
  }, [incomingData, socket, isAccepting, createPC, attachStream]);

  // ─────────────────────────────────────
  //  REJECT CALL
  // ─────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (!incomingData || !socket) return;
    socket.emit('call:rejected', { to: incomingData.from });
    cleanup();
  }, [incomingData, socket, cleanup]);

  // ─────────────────────────────────────
  //  END CALL
  // ─────────────────────────────────────
  const endCall = useCallback(() => {
    logCallEnd();
    if (remoteUser && socket) {
      socket.emit('call:end', { to: remoteUser.id });
    }
    cleanup();
  }, [remoteUser, socket, cleanup, logCallEnd]);

  // ─────────────────────────────────────
  //  SOCKET EVENT LISTENERS
  //  Runs whenever `socket` changes (null→live socket)
  //  This is WHY socket must be passed as state not a ref.
  // ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return; // wait until socket is live

    const onIncoming = (data) => {
      console.log('[CallManager] call:incoming received', data);
      if (callStateRef.current !== 'idle') {
        // Already in a call — auto-reject
        socket.emit('call:rejected', { to: data.from });
        return;
      }
      callStateRef.current = 'incoming';
      initiatorRef.current = false;
      activeCallRef.current = { user: { id: data.from, name: data.callerName, image: data.callerImage }, type: data.callType };
      setCallError('');
      setIncomingData(data);
      setCallState('incoming');
    };

    const onAnswer = async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet.current = true;
        for (const c of pendingCandidates.current) {
          try { await pcRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
        }
        pendingCandidates.current = [];
        callStateRef.current = 'active';
        setCallState('active');
        onCallEvent?.({ status: 'started', callType: activeCallRef.current?.type || 'voice' });
        timerRef.current = setInterval(() => {
          durationRef.current += 1;
          setCallDuration(durationRef.current);
        }, 1000);
      } catch (err) {
        console.error('[Call] Error setting answer:', err);
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (!pcRef.current) {
        if (callStateRef.current === 'incoming') {
          pendingCandidates.current.push(candidate);
        }
        return;
      }
      if (remoteDescSet.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    const onRejected = () => {
      cleanup();
    };

    const onEnd = () => {
      logCallEnd();
      cleanup();
    };

    const onUnavailable = () => {
      cleanup();
      alert('That user is not currently online. Try again later.');
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:rejected', onRejected);
    socket.on('call:end', onEnd);
    socket.on('call:user_unavailable', onUnavailable);

    console.log('[CallManager] Socket listeners attached ✅', socket.id);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onIceCandidate);
      socket.off('call:rejected', onRejected);
      socket.off('call:end', onEnd);
      socket.off('call:user_unavailable', onUnavailable);
    };
  }, [socket, cleanup, logCallEnd, onCallEvent]); // ← re-runs when socket goes from null to live instance

  // ─────────────────────────────────────
  //  MEDIA CONTROLS
  // ─────────────────────────────────────
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = isMuted;
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = isCameraOff;
    setIsCameraOff(!isCameraOff);
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) remoteVideoRef.current.muted = !isSpeakerOff;
    setIsSpeakerOff(!isSpeakerOff);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ─────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────
  return (
    <div className="relative w-full h-full">
      {children}

      {/* ══════════════ INCOMING CALL ══════════════ */}
      {callState === 'incoming' && incomingData && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center pb-16 pointer-events-none">
          <div
            className="bg-[#1a1a2e]/97 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/10 w-[340px] pointer-events-auto animate-in slide-in-from-bottom-8 duration-300"
            style={{ boxShadow: '0 0 80px rgba(100,80,255,0.4)' }}
          >
            {/* Avatar + pulsing rings */}
            <div className="flex justify-center mb-5 relative h-28 items-center">
              <div className="absolute w-32 h-32 rounded-full bg-[#6e54ff]/15 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-[#6e54ff]/25 animate-ping" style={{ animationDelay: '0.25s' }} />
              <div className="relative z-10">
                <Avatar name={incomingData.callerName} image={incomingData.callerImage} />
              </div>
            </div>

            <div className="text-center mb-2">
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                Incoming {incomingData.callType === 'video' ? '📹 Video' : '📞 Voice'} Call
              </p>
              <h3 className="text-white text-[22px] font-black">{incomingData.callerName}</h3>
            </div>

            <div className="flex justify-center gap-12 mt-7">
              {/* Decline */}
              <button onClick={rejectCall} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-red-500 group-hover:bg-red-400 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 transition-all group-hover:scale-110 active:scale-95 cursor-pointer">
                  <PhoneOff size={26} className="text-white" />
                </div>
                <span className="text-white/50 text-xs font-semibold">Decline</span>
              </button>

              {/* Accept */}
              <button onClick={acceptCall} disabled={isAccepting} className="flex flex-col items-center gap-2 group disabled:opacity-60">
                <div className="w-16 h-16 bg-emerald-500 group-hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/40 transition-all group-hover:scale-110 active:scale-95 cursor-pointer animate-bounce">
                  <Phone size={26} className="text-white" />
                </div>
                <span className="text-white/50 text-xs font-semibold">{isAccepting ? 'Connecting...' : 'Accept'}</span>
              </button>
            </div>
            {callError && (
              <p className="mt-5 rounded-xl bg-red-500/15 border border-red-400/30 px-3 py-2.5 text-center text-xs font-medium text-red-200">
                {callError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ OUTGOING CALL ══════════════ */}
      {callState === 'outgoing' && remoteUser && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-2xl"
          style={{ backgroundColor: 'rgba(15, 15, 26, 0.92)' }}
        >
          <div className="text-center flex flex-col items-center gap-7">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full border border-[#6e54ff]/20 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full border border-[#6e54ff]/40 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="relative z-10">
                <Avatar name={remoteUser.name} image={remoteUser.image} />
              </div>
            </div>
            <div>
              <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em] mb-1">
                {callType === 'video' ? 'Video Calling...' : 'Voice Calling...'}
              </p>
              <h2 className="text-white text-2xl font-black">{remoteUser.name}</h2>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center shadow-2xl shadow-red-900/50 hover:scale-110 active:scale-95 transition-all cursor-pointer border-none"
            >
              <PhoneOff size={28} className="text-white" />
            </button>
          </div>
          {callType === 'video' && (
            <div className="absolute bottom-6 right-6 w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <p className="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black/45 rounded-md px-2 py-1">You</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ ACTIVE CALL ══════════════ */}
      {callState === 'active' && remoteUser && (
        <div className="fixed inset-0 z-[300] overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>

          {callType === 'video' ? (
            /* ── Video mode ── */
            <div className="absolute inset-0 bg-black">
              <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" muted={isSpeakerOff} />
              {/* Local PiP */}
              <div className="absolute top-6 right-6 w-52 h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-[#111827] z-10">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">You</span>
                {isCameraOff && (
                  <div className="absolute inset-0 bg-[#111827] flex items-center justify-center">
                    <VideoOff size={22} className="text-white/50" />
                  </div>
                )}
              </div>
              {/* Name + timer overlay */}
              <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 z-10">
                <p className="text-white font-bold text-sm">{remoteUser.name}</p>
                <p className="text-emerald-400 text-xs font-semibold">🔴 {fmt(callDuration)}</p>
              </div>
            </div>
          ) : (
            /* ── Voice mode ── */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#6e54ff]/10 rounded-full blur-3xl pointer-events-none" />
              {/* Hidden audio outputs */}
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" muted={isSpeakerOff} />
              <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />

              <div className="relative flex items-center justify-center">
                <div className="absolute w-40 h-40 rounded-full bg-[#6e54ff]/15 animate-ping" />
                <div className="absolute w-32 h-32 rounded-full bg-[#6e54ff]/25 animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="relative z-10">
                  <Avatar name={remoteUser.name} image={remoteUser.image} />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-white text-2xl font-black">{remoteUser.name}</h2>
                <p className="text-emerald-400 text-base font-semibold mt-2 tracking-wider">
                  🔴 {fmt(callDuration)}
                </p>
              </div>
            </div>
          )}

          {/* ── Control Bar ── */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 flex items-center justify-center gap-5 shadow-2xl">

            {/* Mute */}
            <button onClick={toggleMute} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer ${isMuted ? 'bg-red-500' : 'bg-white/15 hover:bg-white/25'}`}>
                {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
              </div>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* Camera (video only) */}
            {callType === 'video' && (
              <button onClick={toggleCamera} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer ${isCameraOff ? 'bg-red-500' : 'bg-white/15 hover:bg-white/25'}`}>
                  {isCameraOff ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
                </div>
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{isCameraOff ? 'Cam On' : 'Cam Off'}</span>
              </button>
            )}

            {/* Speaker */}
            <button onClick={toggleSpeaker} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer ${isSpeakerOff ? 'bg-red-500' : 'bg-white/15 hover:bg-white/25'}`}>
                {isSpeakerOff ? <VolumeX size={22} className="text-white" /> : <Volume2 size={22} className="text-white" />}
              </div>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{isSpeakerOff ? 'Spkr On' : 'Speaker'}</span>
            </button>

            {/* End Call */}
            <button onClick={endCall} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center shadow-2xl shadow-red-900/50 transition-all hover:scale-110 active:scale-95 cursor-pointer">
                <PhoneOff size={28} className="text-white" />
              </div>
              <span className="text-white/90 text-[10px] font-bold uppercase tracking-wider">End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallManager;
