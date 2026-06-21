import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from '../components/Header';
import ChannelCard from '../components/ChannelCard';
import VideoPlayer from '../components/VideoPlayer';
import FifaPlusSection from '../components/FifaPlusSection';
import type { Channel, Source, FifaPlusStream, WorldCupBroadcaster } from '../types';

const SOURCES: Source[] = [
  { key: 'bd', url: 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/countries/bd.m3u', label: 'Bangladesh' },
  { key: 'in', url: 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/countries/in.m3u', label: 'India' },
  { key: 'sports', url: 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/categories/sports.m3u', label: 'Sports' },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'bd', label: 'Bangladesh' },
  { key: 'in', label: 'India' },
  { key: 'sports', label: 'Sports' },
];

function parseM3U(text: string, countryKey: string, countryLabel: string): Channel[] {
  const lines = text.split(/\r?\n/);
  const channels: Channel[] = [];
  let current: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const idMatch = line.match(/tvg-id="([^"]*)"/);
      const nameMatch = line.match(/,(.*)$/);
      let rawName = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
      let quality = '';
      const qMatch = rawName.match(/\((\d{3,4}p)\)\s*(\[.*\])?$/);
      if (qMatch) quality = qMatch[1];

      current = {
        name: rawName,
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1].split(';')[0] : 'General',
        tvgId: idMatch ? idMatch[1] : '',
        quality: quality,
        country: countryKey,
        countryLabel: countryLabel,
        url: '',
      };
    } else if (line.startsWith('#EXTVLCOPT') || line.startsWith('#EXT-X')) {
      continue;
    } else if (!line.startsWith('#') && current) {
      current.url = line;
      current.isHttps = line.startsWith('https://');
      channels.push(current as Channel);
      current = null;
    }
  }

  return channels;
}

async function loadSource(src: Source): Promise<Channel[]> {
  try {
    const res = await fetch(src.url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    return parseM3U(text, src.key, src.label);
  } catch (e) {
    console.warn('Failed to load', src.key, e);
    return [];
  }
}

export default function Home() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [reliableOnly, setReliableOnly] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | FifaPlusStream | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedBroadcaster, setSelectedBroadcaster] = useState<WorldCupBroadcaster | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const results = await Promise.all(SOURCES.map(loadSource));
      const merged = results.flat();

      const seen = new Set<string>();
      const unique = merged.filter((ch) => {
        const key = ch.country + '|' + ch.name + '|' + ch.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setAllChannels(unique);
      setIsLoading(false);
    }

    init();
  }, []);

  const baseList = useMemo(() => {
    return reliableOnly ? allChannels.filter((c) => c.isHttps) : allChannels;
  }, [allChannels, reliableOnly]);

  const tabCounts = useMemo(() => {
    return {
      all: baseList.length,
      bd: baseList.filter((c) => c.country === 'bd').length,
      in: baseList.filter((c) => c.country === 'in').length,
      sports: baseList.filter((c) => c.country === 'sports').length,
    };
  }, [baseList]);

  const activeList = useMemo(() => {
    let list = baseList;
    if (activeCountry !== 'all') {
      list = list.filter((c) => c.country === activeCountry);
    }
    if (activeCountry === 'sports') {
      list = [...list].sort((a, b) => {
        const score = (ch: Channel) => /\.(in|bd)@/i.test(ch.tvgId || '') ? 0 : 1;
        return score(a) - score(b);
      });
    }
    return list;
  }, [baseList, activeCountry]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeList.forEach((c) => cats.add(c.group || 'General'));
    return Array.from(cats).sort();
  }, [activeList]);

  const filteredList = useMemo(() => {
    let list = activeList;
    if (activeCategory !== 'all') {
      list = list.filter((c) => (c.group || 'General') === activeCategory);
    }
    const q = searchValue.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeList, activeCategory, searchValue]);

  const handleSearchChange = useCallback((value: string) => {
    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setSearchValue(value);
    }, 180);
  }, []);

  const handleChannelClick = useCallback((channel: Channel | FifaPlusStream) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
  }, []);

  const handleBroadcasterClick = useCallback((broadcaster: WorldCupBroadcaster) => {
    setSelectedBroadcaster(broadcaster);
  }, []);

  const handlePlayerClose = useCallback(() => {
    setIsPlayerOpen(false);
    setSelectedChannel(null);
  }, []);

  const handleTabChange = useCallback((key: string) => {
    setActiveCountry(key);
    setActiveCategory('all');
  }, []);

  const countryName = activeCountry === 'all'
    ? 'All Channels'
    : (SOURCES.find((s) => s.key === activeCountry)?.label || 'Channels');

  // Skeleton cards
  const skeletonCards = Array.from({ length: 12 }, (_, i) => (
    <div key={i} className="skeleton-card" />
  ));

  return (
    <div className="min-vh-100" style={{ paddingTop: 72 }}>
      {/* Header */}
      <Header
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        reliableOnly={reliableOnly}
        onReliableToggle={() => setReliableOnly((v) => !v)}
        totalChannels={baseList.length}
        isLoading={isLoading}
      />

      {/* FIFA+ Section */}
      <FifaPlusSection
        onFifaStreamClick={handleChannelClick}
        onBroadcasterClick={handleBroadcasterClick}
      />

      {/* Country Tabs */}
      <div className="container-fluid" style={{ maxWidth: 1440 }}>
        <div className="d-flex flex-wrap gap-2 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`cat-chip ${activeCountry === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              <span
                className="ms-1"
                style={{
                  fontSize: '0.625rem',
                  opacity: 0.7,
                  background: activeCountry === tab.key ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)',
                  padding: '1px 5px',
                }}
              >
                {tabCounts[tab.key as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Rail */}
      <div className="container-fluid" style={{ maxWidth: 1440 }}>
        <div className="d-flex flex-wrap gap-2 pb-3">
          <button
            className={`cat-chip ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            ALL CATEGORIES
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Channel Grid */}
      <main className="container-fluid pb-5" style={{ maxWidth: 1440 }}>
        <div className="section-label">
          {countryName.toUpperCase()} ({filteredList.length})
        </div>

        {isLoading ? (
          <div className="row g-2">
            {skeletonCards.map((card, i) => (
              <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                {card}
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state">
            <div className="big">No channels found</div>
            <span>Try a different search term, or switch off &quot;Playable only&quot; to see more channels.</span>
          </div>
        ) : (
          <div className="row g-2">
            {filteredList.map((ch, idx) => (
              <div key={ch.country + '|' + ch.name + '|' + ch.url} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <ChannelCard
                  channel={ch}
                  index={idx}
                  onClick={handleChannelClick}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="signal-footer">
        <p>
          <span style={{ color: 'var(--signal-orange)' }}>SIGNAL</span> aggregates publicly available, freely accessible IPTV stream links from the open-source{' '}
          <a
            href="https://github.com/iptv-org/iptv"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--teal)' }}
          >
            iptv-org
          </a>{' '}
          project. We don&apos;t host any streams or own any content — every link points to a third-party broadcaster&apos;s own public source. Some streams may be temporarily down, region-locked, or slow depending on the source server, not this site.
        </p>
      </footer>

      {/* Video Player Modal */}
      <VideoPlayer
        channel={selectedChannel}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
      />

      {/* Broadcaster Modal (iframe) */}
      {selectedBroadcaster && (
        <div
          className="player-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBroadcaster(null); }}
        >
          <div className="player-box">
            <div className="player-head">
              <span className="live-tag">
                <span className="blob"></span>
                LIVE
              </span>
              <h3 className="player-title">{selectedBroadcaster.name} — Live</h3>
              <button className="close-btn" onClick={() => setSelectedBroadcaster(null)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="video-wrap" style={{ minHeight: 400 }}>
              <iframe
                src={selectedBroadcaster.embedUrl}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  position: 'absolute',
                  inset: 0,
                }}
                title={selectedBroadcaster.name}
              />
              <div
                className="video-status"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.85), transparent)',
                  padding: '0.875rem',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: '0.625rem',
                }}
              >
                <span style={{ fontSize: '0.6875rem' }}>Player not loading?</span>
                <a
                  href={selectedBroadcaster.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--signal-orange)',
                    border: '1px solid var(--signal-orange)',
                    padding: '4px 12px',
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    textDecoration: 'none',
                  }}
                >
                  Open official site &rarr;
                </a>
              </div>
            </div>
            <div className="player-foot">
              <span>Bangladesh</span>
              <span>FIFA World Cup 2026 &middot; Official</span>
              <span>OFFICIAL BROADCASTER</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
