import React, { useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const LiveStreaming = ({ matchId }) => {
  useEffect(() => {
    const player = videojs('stream-player', {
      controls: true,
      autoplay: false,
      sources: [{ src: 'rtmp://your-stream-server/live/stream', type: 'rtmp/mp4' }],
    });
    return () => player.dispose();
  }, [matchId]);

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h2" color="primary" align="center" gutterBottom>
          Live Stream
        </Typography>
        <video id="stream-player" className="video-js vjs-default-skin" width="100%" height="400" />
      </CardContent>
    </Card>
  );
};

export default LiveStreaming;