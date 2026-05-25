import { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const ATC_FEEDS = [
  { id: 'kjfk_app',  label: 'KJFK — New York JFK',            lat: 40.6413,  lon: -73.7781  },
  { id: 'klax_app',  label: 'KLAX — Los Angeles',              lat: 33.9425,  lon: -118.4081 },
  { id: 'kord_app',  label: "KORD — Chicago O'Hare",           lat: 41.9742,  lon: -87.9073  },
  { id: 'ksfo_app',  label: 'KSFO — San Francisco',            lat: 37.6213,  lon: -122.3790 },
  { id: 'katl_app',  label: 'KATL — Atlanta',                  lat: 33.6407,  lon: -84.4277  },
  { id: 'kdfw_app',  label: 'KDFW — Dallas/Fort Worth',        lat: 32.8998,  lon: -97.0403  },
  { id: 'kden_app',  label: 'KDEN — Denver',                   lat: 39.8561,  lon: -104.6737 },
  { id: 'kbos_app',  label: 'KBOS — Boston Logan',             lat: 42.3656,  lon: -71.0096  },
  { id: 'klas_app',  label: 'KLAS — Las Vegas',                lat: 36.0840,  lon: -115.1537 },
  { id: 'kmia_app',  label: 'KMIA — Miami',                    lat: 25.7959,  lon: -80.2870  },
  { id: 'ksea_app',  label: 'KSEA — Seattle-Tacoma',           lat: 47.4502,  lon: -122.3088 },
  { id: 'kphx_app',  label: 'KPHX — Phoenix Sky Harbor',       lat: 33.4373,  lon: -112.0078 },
  { id: 'kiad_app',  label: 'KIAD — Washington Dulles',        lat: 38.9531,  lon: -77.4565  },
  { id: 'kewr_app',  label: 'KEWR — Newark Liberty',           lat: 40.6895,  lon: -74.1745  },
  { id: 'egll_gnd',  label: 'EGLL — London Heathrow',          lat: 51.4775,  lon: -0.4614   },
  { id: 'eddf',      label: 'EDDF — Frankfurt',                lat: 50.0379,  lon: 8.5622    },
  { id: 'lfpg',      label: 'LFPG — Paris Charles de Gaulle',  lat: 49.0097,  lon: 2.5479    },
  { id: 'rjtt_app',  label: 'RJTT — Tokyo Haneda',             lat: 35.5494,  lon: 139.7798  },
  { id: 'yssy_app',  label: 'YSSY — Sydney Kingsford Smith',   lat: -33.9399, lon: 151.1753  },
  { id: 'cyyz_app',  label: 'CYYZ — Toronto Pearson',          lat: 43.6777,  lon: -79.6248  },
];

// OpenSky state vector field indices
const F = { icao24: 0, callsign: 1, country: 2, lon: 5, lat: 6, alt_baro: 7, on_ground: 8, velocity: 9, heading: 10, vert_rate: 11, squawk: 14 };

function metersToFeet(m) { return m != null ? Math.round(m * 3.28084) : null; }
function msToKnots(v) { return v != null ? Math.round(v * 1.94384) : null; }

function makePlaneIcon(heading, selected) {
  const color = selected ? '#E0FF00' : '#60a5fa';
  const glow = selected ? 'drop-shadow(0 0 4px #E0FF00)' : 'drop-shadow(0 0 2px rgba(96,165,250,0.6))';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" style="transform:rotate(${(heading || 0)}deg);filter:${glow}">
    <path fill="${color}" d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function ATCApp() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const audioRef = useRef(null);
  const fetchTimerRef = useRef(null);

  const [selectedFeed, setSelectedFeed] = useState(ATC_FEEDS[0]);
  const [audioStatus, setAudioStatus] = useState('idle');
  const [volume, setVolume] = useState(0.8);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [flightCount, setFlightCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [streamError, setStreamError] = useState(false);

  const selectedAircraftRef = useRef(null);
  selectedAircraftRef.current = selectedAircraft;

  const selectAircraft = useCallback((aircraft) => {
    const prev = selectedAircraftRef.current;
    setSelectedAircraft(aircraft);
    // Refresh icon for previously selected
    if (prev && markersRef.current[prev.icao24]) {
      markersRef.current[prev.icao24].setIcon(makePlaneIcon(prev.heading, false));
    }
    if (aircraft && markersRef.current[aircraft.icao24]) {
      markersRef.current[aircraft.icao24].setIcon(makePlaneIcon(aircraft.heading, true));
    }
  }, []);

  const fetchFlights = useCallback(async () => {
    if (!mapRef.current) return;
    setIsLoadingFlights(true);
    try {
      const bounds = mapRef.current.getBounds();
      const url = `https://opensky-network.org/api/states/all?lamin=${bounds.getSouth().toFixed(2)}&lomin=${bounds.getWest().toFixed(2)}&lamax=${bounds.getNorth().toFixed(2)}&lomax=${bounds.getEast().toFixed(2)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const states = data.states || [];

      const airborne = states.filter(s =>
        s[F.lat] != null && s[F.lon] != null && !s[F.on_ground]
      );

      setFlightCount(airborne.length);
      setLastUpdate(new Date());

      const seen = new Set();
      airborne.forEach(s => {
        const icao = s[F.icao24];
        seen.add(icao);
        const ac = {
          icao24: icao,
          callsign: (s[F.callsign] || icao).trim(),
          country: s[F.country],
          lat: s[F.lat],
          lon: s[F.lon],
          altitude: metersToFeet(s[F.alt_baro]),
          speed: msToKnots(s[F.velocity]),
          heading: s[F.heading] || 0,
          vertRate: s[F.vert_rate] != null ? Math.round(s[F.vert_rate] * 196.85) : null,
          squawk: s[F.squawk],
        };
        const isSelected = selectedAircraftRef.current?.icao24 === icao;

        if (markersRef.current[icao]) {
          markersRef.current[icao].setLatLng([ac.lat, ac.lon]);
          markersRef.current[icao].setIcon(makePlaneIcon(ac.heading, isSelected));
          markersRef.current[icao]._acData = ac;
        } else {
          const marker = L.marker([ac.lat, ac.lon], { icon: makePlaneIcon(ac.heading, false) });
          marker._acData = ac;
          marker.on('click', () => selectAircraft(marker._acData));
          marker.addTo(mapRef.current);
          markersRef.current[icao] = marker;
        }

        if (isSelected) {
          setSelectedAircraft(ac);
        }
      });

      // Remove markers that are no longer in view / airborne
      Object.keys(markersRef.current).forEach(icao => {
        if (!seen.has(icao)) {
          markersRef.current[icao].remove();
          delete markersRef.current[icao];
        }
      });
    } catch {
      // Silently fail — keep showing old markers
    } finally {
      setIsLoadingFlights(false);
    }
  }, [selectAircraft]);

  // Init Leaflet map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [39, -98],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    map.zoomControl.setPosition('bottomright');

    mapRef.current = map;

    // Fetch on move end with debounce
    let moveTimer = null;
    map.on('moveend', () => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(fetchFlights, 600);
    });

    fetchFlights();
    fetchTimerRef.current = setInterval(fetchFlights, 20000);

    return () => {
      clearInterval(fetchTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [fetchFlights]);

  // Audio setup
  const playStream = useCallback(() => {
    if (!audioRef.current) return;
    setStreamError(false);
    setAudioStatus('loading');
    const streamUrl = `https://s1-fmt2.liveatc.net/${selectedFeed.id}`;
    audioRef.current.src = streamUrl;
    audioRef.current.volume = volume;
    audioRef.current.play().catch(() => setStreamError(true));
  }, [selectedFeed, volume]);

  const stopStream = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    setAudioStatus('idle');
  }, []);

  const togglePlay = useCallback(() => {
    if (audioStatus === 'idle' || audioStatus === 'error') {
      playStream();
    } else {
      stopStream();
    }
  }, [audioStatus, playStream, stopStream]);

  // When feed changes while playing, restart
  useEffect(() => {
    if (audioStatus === 'playing' || audioStatus === 'loading') {
      stopStream();
      setTimeout(playStream, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeed]);

  // Fly map to selected feed airport
  const flyToFeed = (feed) => {
    setSelectedFeed(feed);
    if (mapRef.current) {
      mapRef.current.flyTo([feed.lat, feed.lon], 10, { duration: 1.2 });
    }
  };

  const vertRateDisplay = (vr) => {
    if (vr == null) return '—';
    if (vr > 100) return `+${vr} fpm ↑`;
    if (vr < -100) return `${vr} fpm ↓`;
    return 'Level';
  };

  return (
    <div className="flex h-full bg-[#0A0A0A] text-white overflow-hidden">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onPlaying={() => setAudioStatus('playing')}
        onWaiting={() => setAudioStatus('loading')}
        onError={() => { setAudioStatus('error'); setStreamError(true); }}
        onEnded={() => setAudioStatus('idle')}
        onPause={() => setAudioStatus('idle')}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map overlay: top-left info */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="bg-black/80 border border-zinc-800 px-3 py-1.5 font-mono text-xs flex items-center gap-3">
            <span className="text-[#E0FF00] font-bold">ATC LIVE</span>
            <span className="text-zinc-400">{flightCount} aircraft</span>
            {isLoadingFlights && (
              <span className="w-2 h-2 rounded-full bg-[#E0FF00] animate-pulse" />
            )}
            {lastUpdate && (
              <span className="text-zinc-600 hidden sm:block">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Map overlay: legend */}
        <div className="absolute bottom-8 left-3 z-[1000] bg-black/70 border border-zinc-800 px-3 py-2 font-mono text-[10px] text-zinc-500 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400">✈</span> Airborne aircraft
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#E0FF00]">✈</span> Selected
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-[#0F0F0F] border-l border-zinc-800 flex flex-col overflow-hidden shrink-0">

        {/* Panel header */}
        <div className="bg-[#E0FF00] text-black px-4 py-2 font-black text-sm uppercase italic tracking-tight flex items-center justify-between shrink-0">
          <span>ATC Live Radar</span>
          <span className="text-[10px] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Selected aircraft card */}
        <div className="p-4 border-b border-zinc-800 shrink-0">
          <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest mb-2">
            Selected Aircraft
          </div>
          {selectedAircraft ? (
            <div className="bg-zinc-900 border border-zinc-700 p-3 font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#E0FF00] font-black text-lg uppercase">
                  {selectedAircraft.callsign || selectedAircraft.icao24}
                </span>
                <button
                  onClick={() => selectAircraft(null)}
                  className="text-zinc-600 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-400">
                <span>ICAO24</span>
                <span className="text-white uppercase">{selectedAircraft.icao24}</span>
                <span>Country</span>
                <span className="text-white">{selectedAircraft.country || '—'}</span>
                <span>Altitude</span>
                <span className="text-white">
                  {selectedAircraft.altitude != null ? `${selectedAircraft.altitude.toLocaleString()} ft` : '—'}
                </span>
                <span>Speed</span>
                <span className="text-white">
                  {selectedAircraft.speed != null ? `${selectedAircraft.speed} kts` : '—'}
                </span>
                <span>Heading</span>
                <span className="text-white">
                  {selectedAircraft.heading != null ? `${Math.round(selectedAircraft.heading)}°` : '—'}
                </span>
                <span>Vert Rate</span>
                <span className="text-white">{vertRateDisplay(selectedAircraft.vertRate)}</span>
                {selectedAircraft.squawk && (
                  <>
                    <span>Squawk</span>
                    <span className="text-white">{selectedAircraft.squawk}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 text-xs font-mono border border-dashed border-zinc-800 p-3 text-center">
              Click any aircraft on the map
            </div>
          )}
        </div>

        {/* ATC Audio section */}
        <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">
            ATC Audio Stream
          </div>

          {/* Airport selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-600 block mb-1">
              Select Airport / Feed
            </label>
            <select
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs font-mono py-2 px-2 focus:outline-none focus:border-[#E0FF00] cursor-pointer"
              value={selectedFeed.id}
              onChange={(e) => {
                const feed = ATC_FEEDS.find(f => f.id === e.target.value);
                if (feed) flyToFeed(feed);
              }}
            >
              {ATC_FEEDS.map(feed => (
                <option key={feed.id} value={feed.id}>{feed.label}</option>
              ))}
            </select>
          </div>

          {/* Stream status indicator */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className={`w-2 h-2 rounded-full ${
              audioStatus === 'playing' ? 'bg-green-400 animate-pulse' :
              audioStatus === 'loading' ? 'bg-yellow-400 animate-pulse' :
              audioStatus === 'error'   ? 'bg-red-500' :
              'bg-zinc-600'
            }`} />
            <span className="text-zinc-400 uppercase text-[10px] tracking-wider">
              {audioStatus === 'playing' ? 'Streaming ATC' :
               audioStatus === 'loading' ? 'Connecting...' :
               audioStatus === 'error'   ? 'Stream error' :
               'Stopped'}
            </span>
          </div>

          {/* Play / Stop button */}
          <button
            onClick={togglePlay}
            className={`w-full py-2 font-black uppercase tracking-widest text-sm border-2 transition-all ${
              audioStatus === 'playing' || audioStatus === 'loading'
                ? 'bg-transparent border-red-500 text-red-400 hover:bg-red-500 hover:text-black'
                : 'bg-[#E0FF00] border-[#E0FF00] text-black hover:bg-transparent hover:text-[#E0FF00]'
            }`}
          >
            {audioStatus === 'playing' ? '⏹ Stop Stream' :
             audioStatus === 'loading' ? '⏳ Connecting...' :
             '▶ Play Stream'}
          </button>

          {/* Volume slider */}
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-600 block mb-1">
              Volume — {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-full accent-[#E0FF00] cursor-pointer"
            />
          </div>

          {/* Error / Fallback */}
          {streamError && (
            <div className="bg-zinc-900 border border-red-900 p-3 text-xs font-mono">
              <p className="text-red-400 mb-2">
                Direct stream unavailable (CORS or feed offline).
              </p>
              <a
                href={`https://www.liveatc.net/play/${selectedFeed.id}.pls`}
                target="_blank"
                rel="noreferrer"
                className="text-[#E0FF00] underline"
                onClick={() => setStreamError(false)}
              >
                Open feed on LiveATC.net ↗
              </a>
              <p className="text-zinc-600 mt-1 text-[10px]">
                Opens in your system media player
              </p>
            </div>
          )}

          {/* How-to hint */}
          {audioStatus === 'idle' && !streamError && (
            <div className="text-[10px] font-mono text-zinc-700 leading-relaxed">
              Select an airport and press Play to hear live ATC communications.
              Audio is sourced from LiveATC.net volunteer receivers.
            </div>
          )}

          {/* Fly to airport button */}
          <button
            onClick={() => flyToFeed(selectedFeed)}
            className="w-full py-1.5 border border-zinc-700 text-zinc-400 hover:border-[#E0FF00] hover:text-[#E0FF00] font-mono text-xs uppercase tracking-widest transition-colors"
          >
            ⊕ Fly to {selectedFeed.label.split('—')[0].trim()} on Map
          </button>

          {/* Divider */}
          <div className="border-t border-zinc-800 mt-2" />

          {/* OpenSky attribution */}
          <div className="text-[10px] font-mono text-zinc-700 leading-relaxed">
            <span className="text-zinc-500">Flight data:</span> OpenSky Network · Refreshes every 20s
            <br />
            <span className="text-zinc-500">ATC audio:</span> LiveATC.net
          </div>
        </div>
      </div>
    </div>
  );
}
