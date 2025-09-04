"use client"

import { useEffect, useRef } from "react"
import YouTube, { YouTubeEvent }  from "react-youtube"

interface YoutubeProps{
    videoId: string | null
    isPlaying: boolean
    currentTime: number
    onReady: () => void
    onPlay: (t: number) => void
    onPause: (t: number) => void
    onSeek: (t: number) => void
}

export const YoutubePlayer = ({
    videoId,
    isPlaying,
    currentTime,
    onReady,
    onPlay,
    onPause,
    onSeek
}: YoutubeProps) => {
    const playerRef = useRef<YT.Player | null>(null)
    const lastSyncedTimeRef = useRef(0)

    useEffect(() => {
        const p = playerRef.current
        if(!p || !videoId){
            return
        }

        const current = p.getCurrentTime?.() || 0

        if(p.getVideoData().video_id !== videoId){
            p.loadVideoById(videoId, currentTime)
            if(!isPlaying){
                setTimeout(() => p.pauseVideo(), 50)
            }
            return
        }

        const drift = Math.abs(current - currentTime)
        if(drift > 0.6){
            p.seekTo(currentTime, true)
        }

        if (isPlaying && p.getPlayerState() !== YT.PlayerState.PLAYING){
            p.playVideo()
        }
        else if(!isPlaying && p.getPlayerState() === YT.PlayerState.PLAYING){
            p.pauseVideo()
        }
    }, [videoId, isPlaying, currentTime])

    const onPlayerReady = (e: YouTubeEvent) => {
        playerRef.current = e.target
        onReady()
    }

    const onStateChange = (e: YT.OnStateChangeEvent) => {
        const p = playerRef.current
        if(!p){
            return
        }

        const t = p.getCurrentTime() || 0
        if(e.data === YT.PlayerState.PLAYING){
            onPlay(t)
        } else if (e.data === YT.PlayerState.PAUSED){
            onPause(t)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const p = playerRef.current

            if(!p){
                return
            }

            const t = p.getCurrentTime() || 0
            const drift = Math.abs(t - lastSyncedTimeRef.current)

            if (drift > 1.0 && p.getPlayerState() === YT.PlayerState.PAUSED){
                onSeek(t)
            }

            lastSyncedTimeRef.current = t
        }, 1000)

        return () => clearInterval(interval)
    }, [onSeek])


    const opts = {
        width: "100%",
        height: "450",
        playerVars: {
            controls: 1,
            rel: 0,
            modestbranding: 1,
            disablekb: 0
        }
    }

    return (
        <>
            <div>
                <div className="w-full">
                    {videoId ? (
                    <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={onPlayerReady}
                        onStateChange={onStateChange}
                        onEnd={() => {}}
                    />
                    ) : (
                    <div className="text-center py-10 text-neutral-400">
                        No video selected yet.
                    </div>
                    )}
                </div>
            </div>
        </>
    )
}