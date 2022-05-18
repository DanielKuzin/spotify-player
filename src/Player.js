import { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";

export default function Player({
  accessToken,
  trackUri,
  chooseNextTrackFromPoll,
}) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    setPlay(true);
  }, [trackUri]);

  if (!accessToken) return null;

  return (
    <SpotifyPlayer
      token={accessToken}
      showSaveIcon
      callback={(state) => {
        if (!state.isPlaying) setPlay(false);
        if (
          // song ended
          state.isActive === true &&
          state.type === "player_update" &&
          state.isPlaying === false &&
          state.progressMs === 0
        ) {
          chooseNextTrackFromPoll();
        }
      }}
      play={play}
      uris={trackUri ? [trackUri] : []}
      syncExternalDevice
      autoPlay
      magnifySliderOnHover
      syncExternalDeviceInterval={5}
    ></SpotifyPlayer>
  );
}
