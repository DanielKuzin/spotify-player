import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import AlbumSearchResult from "./AlbumSearchResult";
import PlaylistSearchResult from "./PlaylistSearchResult";
import Player from "./Player";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: "1b92d625825c465aa3f2ec73e22162b5",
});

// const serverUrl = "http://localhost:3001";
const serverUrl = "https://dans-player-server.lm.r.appspot.com";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allAlbumTracks, setAllAlbumTracks] = useState([]);
  const [albumTracksLeftToPlay, setAlbumTracksLeftToPlay] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [playingAlbum, setPlayingAlbum] = useState();
  const [searchPlaylists, setSearchPlaylists] = useState(false);

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  function clearVotedUsers() {
    axios.delete(serverUrl + "/voted");
  }

  function handleClick() {
    setSearchPlaylists(!searchPlaylists);
  }

  function chooseNextTrackFromPoll() {
    axios.get("https://627b91cfb54fe6ee008a6235.mockapi.io/data/1").then(
      (response) => {
        let maxVote = 0;
        let nextSongIndex = 0;
        if (response.data.song1Votes > maxVote) {
          maxVote = response.data.song1Votes;
          nextSongIndex = 0;
        }
        if (response.data.song2Votes > maxVote) {
          maxVote = response.data.song2Votes;
          nextSongIndex = 1;
        }
        if (response.data.song3Votes > maxVote) {
          maxVote = response.data.song3Votes;
          nextSongIndex = 2;
        }
        if (response.data.song4Votes > maxVote) {
          maxVote = response.data.song4Votes;
          nextSongIndex = 3;
        }
        let tracksLeftToPlay = albumTracksLeftToPlay;
        let nextTrack = tracksLeftToPlay[nextSongIndex];
        tracksLeftToPlay.splice(nextSongIndex, 1); // remove next song
        if (tracksLeftToPlay.length < 4) {
          tracksLeftToPlay = [
            ...allAlbumTracks.filter((track) => track.name !== nextTrack.name),
          ];
        }
        shuffleArray(tracksLeftToPlay);
        setAlbumTracksLeftToPlay(tracksLeftToPlay);
        addTracksToPollAndPlayTrack(nextTrack, tracksLeftToPlay.slice(0, 4));
      },
      (error) => {
        console.log(error);
      }
    );
  }

  function chooseTrack(track) {
    setPlayingTrack(track);
    axios
      .put("https://627b91cfb54fe6ee008a6235.mockapi.io/data/1", {
        playingSongName: track.name,
        playingSongArtist: track.artists[0].name,
      })
      .then(
        (response) => {
          // console.log(response);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  function addTracksToPollAndPlayTrack(trackToPlay, tracksToAddToPoll) {
    setPlayingTrack(trackToPlay);
    setSearch("");
    axios
      .put("https://627b91cfb54fe6ee008a6235.mockapi.io/data/1", {
        playingSongName: trackToPlay.name,
        playingSongArtist: trackToPlay.artists[0].name,
        song1Name: tracksToAddToPoll[0].name || "",
        song1Artist: tracksToAddToPoll[0].artists[0].name,
        song2Name: tracksToAddToPoll[1].name,
        song2Artist: tracksToAddToPoll[1].artists[0].name,
        song3Name: tracksToAddToPoll[2].name,
        song3Artist: tracksToAddToPoll[2].artists[0].name,
        song4Name: tracksToAddToPoll[3].name,
        song4Artist: tracksToAddToPoll[3].artists[0].name,
        song1Votes: 0,
        song2Votes: 0,
        song3Votes: 0,
        song4Votes: 0,
      })
      .then(
        (response) => {
          // console.log(response);
        },
        (error) => {
          console.log(error);
        }
      );
    clearVotedUsers();
  }

  function choosePlaylist(playlistID, playlistImage, playlistName) {
    setPlayingAlbum({
      name: playlistName,
      image: playlistImage,
    });
    setSearch("");
    spotifyApi
      .getPlaylistTracks(playlistID, {
        limit: 100,
      })
      .then(
        (res) => {
          console.log(res);
          setAllAlbumTracks(res.body.items);
          let tracksLeftToPlay = [...res.body.items];
          shuffleArray(tracksLeftToPlay);
          let trackToPlayNow = tracksLeftToPlay[0];
          tracksLeftToPlay.shift(); // remove trackToPlayNow
          setAlbumTracksLeftToPlay(tracksLeftToPlay);
          addTracksToPollAndPlayTrack(
            trackToPlayNow,
            tracksLeftToPlay.slice(0, 4)
          );
        },
        (error) => {
          console.log(error);
        }
      );
  }

  function chooseAlbum(albumID, albumImage, albumName) {
    setPlayingAlbum({
      name: albumName,
      image: albumImage,
    });
    setSearch("");
    spotifyApi
      .getAlbumTracks(albumID, {
        limit: 50,
      })
      .then((res) => {
        setAllAlbumTracks(res.body.items);
        let tracksLeftToPlay = [...res.body.items];
        shuffleArray(tracksLeftToPlay);
        let trackToPlayNow = tracksLeftToPlay[0];
        tracksLeftToPlay.shift(); // remove trackToPlayNow
        setAlbumTracksLeftToPlay(tracksLeftToPlay);
        addTracksToPollAndPlayTrack(
          trackToPlayNow,
          tracksLeftToPlay.slice(0, 4)
        );
      });
  }

  // function searchTracks(cancel) {
  //   spotifyApi.searchTracks(search).then((res) => {
  //     if (cancel) return;
  //     setSearchResults(
  //       res.body.tracks.items.map((track) => {
  //         const smallestAlbumImage = track.album.images.reduce(
  //           (smallest, image) => {
  //             if (image.height < smallest.height) return image;
  //             return smallest;
  //           },
  //           track.album.images[0]
  //         );
  //         return {
  //           artist: track.artists[0].name,
  //           title: track.name,
  //           uri: track.uri,
  //           albumUrl: smallestAlbumImage.url,
  //         };
  //       })
  //     );
  //   });
  // }

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const searchAlbums = (cancel) => {
      spotifyApi.searchAlbums(search).then((res) => {
        if (cancel) return;
        setSearchResults(
          res.body.albums.items
            .filter((album) => album.total_tracks > 4)
            .map((album) => {
              const smallestAlbumImage = album.images.reduce(
                (smallest, image) => {
                  if (image.height < smallest.height) return image;
                  return smallest;
                },
                album.images[0]
              );
              return {
                title: album.name,
                uri: album.uri,
                spotifyUri: album.external_urls.spotify,
                albumImage: smallestAlbumImage.url,
                totalTracks: album.total_tracks,
                id: album.id,
                artists: album.artists,
              };
            })
        );
      });
    };

    const searchUserPlaylists = (cancel) => {
      spotifyApi
        .getUserPlaylists({
          limit: 50,
        })
        .then((res) => {
          if (cancel) return;
          setSearchResults(
            res.body.items.map((playlist) => {
              const smallestPlaylistImage = playlist.images.reduce(
                (smallest, image) => {
                  if (image.height < smallest.height) return image;
                  return smallest;
                },
                playlist.images[0]
              );
              return {
                title: playlist.name,
                uri: playlist.uri,
                spotifyUri: playlist.external_urls.spotify,
                playlistImage: smallestPlaylistImage.url,
                totalTracks: playlist.tracks.total,
                id: playlist.id,
                artists: "",
              };
            })
          );
        });
    };

    if (!search) return setSearchResults([]);
    if (!accessToken) return;
    let cancel = false;
    if (searchPlaylists) {
      searchUserPlaylists(cancel);
    } else {
      searchAlbums(cancel);
    }
    return () => (cancel = true);
  }, [search, accessToken, searchPlaylists]);

  return (
    <Container
      className="d-flex flex-column py-2"
      style={{
        height: "100vh",
        backgroundImage: `url("https://i.pinimg.com/564x/13/62/25/1362258d5fa4a20660ab5ede0ce9c0ed.jpg")`,
      }}
    >
      <div className="d-flex m-2 align-items-center">
        <Form.Control
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleClick}>
          {searchPlaylists ? "Playlists" : "Albums"}
        </button>
      </div>

      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchPlaylists
          ? searchResults.map((playlist) => (
              <PlaylistSearchResult
                playlist={playlist}
                choosePlaylist={choosePlaylist}
                key={playlist.uri}
              />
            ))
          : searchResults.map((album) => (
              <AlbumSearchResult
                album={album}
                chooseAlbum={chooseAlbum}
                key={album.uri}
              />
            ))}
        {searchResults.length === 0 && (
          <div className="text-center" style={{ whiteSpace: "pre" }}>
            {}
          </div>
        )}
      </div>
      {allAlbumTracks.length > 1 && playingTrack && (
        <h2 className="text-center" style={{ color: "purple" }}>
          {playingAlbum.name}
        </h2>
      )}
      {searchResults.length === 0 && (
        <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
          {allAlbumTracks.map((track) => (
            <TrackSearchResult
              track={track}
              chooseTrack={chooseTrack}
              key={track.uri}
            />
          ))}
        </div>
      )}
      {playingTrack && (
        <div className="d-flex m-2 align-items-center">
          <img
            src={playingAlbum.image}
            style={{ height: "64px", width: "64px" }}
            alt=""
          />
          <div className="d-flex m-2 align-items-center">
            {"Playing playlist " +
              (playingAlbum.name ? " : " + playingAlbum.name : "")}
          </div>
        </div>
      )}
      <div>
        <Player
          accessToken={accessToken}
          trackUri={playingTrack?.uri}
          chooseNextTrackFromPoll={chooseNextTrackFromPoll}
        ></Player>
      </div>
    </Container>
  );
}
