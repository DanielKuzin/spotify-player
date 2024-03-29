import React from "react";

export default function TrackSearchResult({ track, chooseTrack }) {
  function handlePlay() {
    chooseTrack(track);
  }
  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{
        marginRight: 40,
        marginLeft: 40,
        marginTop: 10,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: "#C5B9E0",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#fff",
        cursor: "pointer",
      }}
      onClick={handlePlay}
    >
      <div className="ms-3">
        <div>{track.name}</div>
        <div className="text-muted">{track.artists[0].name}</div>
      </div>
    </div>
  );
}
