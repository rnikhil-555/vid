'use client';

import { useRef, useState, useEffect } from 'react';
import { Channel, Stream } from '@/types/live-tv';
import Hls from 'hls.js';
import { Loader2 } from "lucide-react";
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import {
    defaultLayoutIcons,
    DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

interface VideoPlayerProps {
    channel: Channel & { stream?: Stream };
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
    const playerRef = useRef<MediaPlayerInstance>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const streamUrl = channel.stream?.url;
        if (!streamUrl) return;

        try {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hlsRef.current = hls;

                const mediaElement = playerRef.current?.el as HTMLMediaElement;
                if (mediaElement) {
                    hls.loadSource(streamUrl);
                    hls.attachMedia(mediaElement);
                }

                hls.on(Hls.Events.MANIFEST_LOADED, () => {
                    const videoElement = playerRef.current?.el as HTMLMediaElement;
                    videoElement?.play().catch(err => {
                        console.error('Playback failed:', err);
                        setError('Failed to start playback');
                    });
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        setError('Failed to load stream');
                    }
                });
            }
        } catch (err) {
            console.error('Stream error:', err);
            setError('Failed to load stream');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [channel.stream?.url]);

    if (!channel.stream?.url) {
        return (
            <div className="w-full aspect-video bg-black/95 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                    <p className="text-white/70">No stream available</p>
                    <p className="text-sm text-white/50">{channel.name}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black/95 rounded-lg overflow-hidden group">
            <MediaPlayer
                className="w-full h-full"
                title={channel.name}
                src={channel.stream.url}
                poster={channel.logo}
                ref={playerRef}
                autoPlay
            >
                <MediaProvider>
                    <DefaultVideoLayout
                        icons={defaultLayoutIcons}
                        smallLayoutWhen={false}
                        thumbnails=""

                    />
                </MediaProvider>
            </MediaPlayer>

            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white font-medium truncate">{channel.name}</h3>
            </div>

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                        <p className="text-red-500 font-medium">{error}</p>
                        <p className="text-sm text-white/70">
                            Please try again later
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}