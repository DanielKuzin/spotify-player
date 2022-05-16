import { useState, useEffect } from "react";
import useAuth from "../useAuth";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import AlbumSearchResult from "./AlbumSearchResult";
import Player from "./Player";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: "1b92d625825c465aa3f2ec73e22162b5",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allAlbumTracks, setAllAlbumTracks] = useState([]);
  const [albumTracksLeftToPlay, setAlbumTracksLeftToPlay] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [playingAlbum, setPlayingAlbum] = useState();

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
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
            ...allAlbumTracks.filter((track) => track.name != nextTrack.name),
          ];
        }
        shuffleArray(tracksLeftToPlay);
        setAlbumTracksLeftToPlay(tracksLeftToPlay);
        addTracksToPoll(tracksLeftToPlay.slice(0, 4));
        chooseTrack(nextTrack);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  function addTracksToPoll(tracks) {
    axios
      .put("https://627b91cfb54fe6ee008a6235.mockapi.io/data/1", {
        song1Name: tracks[0].name || "",
        song1Artist: tracks[0].artists[0].name,
        song2Name: tracks[1].name,
        song2Artist: tracks[1].artists[0].name,
        song3Name: tracks[2].name,
        song3Artist: tracks[2].artists[0].name,
        song4Name: tracks[3].name,
        song4Artist: tracks[3].artists[0].name,
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
  }

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
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
        chooseTrack(trackToPlayNow);
        tracksLeftToPlay.shift(); // remove trackToPlayNow
        setAlbumTracksLeftToPlay(tracksLeftToPlay);
        addTracksToPoll(tracksLeftToPlay.slice(0, 4));
      });
  }

  function searchTracks(cancel) {
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );
          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });
  }

  function searchAlbums(cancel) {
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
            };
          })
      );
    });
  }

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;
    let cancel = false;
    searchAlbums(cancel);
    return () => (cancel = true);
  }, [search, accessToken]);

  return (
    <Container
      className="d-flex flex-column py-2"
      style={{
        height: "100vh",
        backgroundImage: `url("https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")`,
      }}
    >
      <Form.Control
        type="search"
        placeholder="Search Playlists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map((album) => (
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
