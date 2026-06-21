import type { FifaPlusStream, WorldCupBroadcaster } from '../types';

interface FifaPlusSectionProps {
  onFifaStreamClick: (stream: FifaPlusStream) => void;
  onBroadcasterClick: (broadcaster: WorldCupBroadcaster) => void;
}

const FIFA_PLUS_STREAMS: FifaPlusStream[] = [
  {
    name: 'FIFA+ (EU/UK)',
    region: 'Europe / UK',
    desc: 'Official FIFA+ English stream via Rakuten — 720p HLS. Covers FIFA tournaments, archive matches, and original content.',
    streamUrl: 'https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8',
    quality: '720p',
    language: 'English',
  },
  {
    name: 'FIFA+ (United States)',
    region: 'United States',
    desc: 'Official FIFA+ US stream via Samsung TV Plus — 720p HLS. Live matches, replays, and FIFA original programming.',
    streamUrl: 'https://d2w9q46ikgrcwx.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-of5cbk3sav3w5/v1/sysdata_s_p_a_fifa_7/samsungheadend_us/latest/main/hls/playlist.m3u8',
    quality: '720p',
    language: 'English',
  },
];

const WORLD_CUP_BROADCASTERS: WorldCupBroadcaster[] = [
  {
    name: 'BTV',
    desc: 'State broadcaster — official FIFA rights holder for Bangladesh. Free live stream of World Cup matches.',
    embedUrl: 'https://www.btvlive.gov.bd/channel/BTV',
    directUrl: 'https://www.btvlive.gov.bd/channel/BTV',
  },
  {
    name: 'T Sports',
    desc: 'Part of the BD broadcast consortium with BTV and Somoy TV. Official World Cup broadcaster.',
    embedUrl: 'https://www.tsports.com/live-tv',
    directUrl: 'https://www.tsports.com/live-tv',
  },
  {
    name: 'Somoy TV',
    desc: 'Part of the BD broadcast consortium with BTV and T Sports. Official World Cup broadcaster.',
    embedUrl: 'https://www.somoynews.tv/tv',
    directUrl: 'https://www.somoynews.tv/tv',
  },
];

export { FIFA_PLUS_STREAMS, WORLD_CUP_BROADCASTERS };

export default function FifaPlusSection({ onFifaStreamClick, onBroadcasterClick }: FifaPlusSectionProps) {
  return (
    <section className="fifa-banner">
      <div className="container-fluid" style={{ maxWidth: 1440 }}>
        {/* World Cup Banner */}
        <div className="py-4">
          <span
            className="font-mono d-block mb-2"
            style={{
              fontSize: '0.6875rem',
              color: 'var(--signal-orange)',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}
          >
            FIFA WORLD CUP 2026 &middot; OFFICIAL BROADCASTERS
          </span>
          <h2
            className="font-display mb-2"
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Watch the World Cup, legally and free
          </h2>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--paper-dim)',
              maxWidth: 640,
              lineHeight: 1.6,
            }}
          >
            BTV, Somoy TV and T Sports hold the official Bangladesh broadcast rights for the 2026 World Cup.
            These are their own free live streams — not a third-party rebroadcast.
          </p>

          {/* Broadcaster Cards */}
          <div className="row g-3 mt-1">
            {WORLD_CUP_BROADCASTERS.map((b) => (
              <div key={b.name} className="col-md-4">
                <div
                  className="fifa-card p-3 h-100 d-flex flex-column"
                  onClick={() => onBroadcasterClick(b)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="font-display"
                      style={{ fontWeight: 800, fontSize: '1rem' }}
                    >
                      {b.name}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--live-green)',
                        border: '1px solid rgba(61,220,132,0.3)',
                        padding: '2px 6px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      OFFICIAL
                    </span>
                  </div>
                  <p
                    className="font-mono mb-3 flex-grow-1"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--paper-dim)',
                      lineHeight: 1.5,
                    }}
                  >
                    {b.desc}
                  </p>
                  <div
                    className="font-mono d-flex align-items-center gap-2 mt-auto"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--signal-orange)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span>Watch live</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIFA+ Streams */}
        <div className="pb-4">
          <div className="section-label">FIFA+ FREE STREAMS</div>
          <div className="row g-3">
            {FIFA_PLUS_STREAMS.map((stream) => (
              <div key={stream.name} className="col-md-6">
                <div
                  className="fifa-card p-3 h-100 d-flex flex-column"
                  onClick={() => onFifaStreamClick(stream)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="font-display"
                      style={{ fontWeight: 800, fontSize: '1rem' }}
                    >
                      {stream.name}
                    </span>
                    <div className="d-flex gap-2">
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.625rem',
                          color: 'var(--live-green)',
                          border: '1px solid rgba(61,220,132,0.3)',
                          padding: '2px 6px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {stream.quality}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.625rem',
                          color: 'var(--teal)',
                          border: '1px solid rgba(62,138,130,0.35)',
                          padding: '2px 6px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {stream.language}
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-mono mb-2 flex-grow-1"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--paper-dim)',
                      lineHeight: 1.5,
                    }}
                  >
                    {stream.desc}
                  </p>
                  <div
                    className="font-mono d-flex align-items-center gap-2 mt-auto"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--signal-orange)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Play stream</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DAZN Note */}
          <div
            className="mt-3 p-3"
            style={{
              background: 'var(--panel-raised)',
              border: '1px solid var(--line)',
            }}
          >
            <p
              className="font-mono mb-0"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--paper-dim)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: 'var(--paper)' }}>FIFA+ on DAZN:</strong>{' '}
              FIFA+ content has moved to DAZN as of June 2026. Matches remain free —
              create a DAZN account and link your FIFA ID at{' '}
              <a
                href="https://www.dazn.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--signal-orange)' }}
              >
                dazn.com
              </a>{' '}
              to access FIFA+ live streams, replays, and archive content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
