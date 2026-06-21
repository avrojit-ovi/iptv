import { Card } from 'react-bootstrap';
import type { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  index: number;
  onClick: (channel: Channel) => void;
}

function cleanName(name: string): string {
  return name.replace(/\s*\(\d{3,4}p\)\s*(\[.*\])?\s*$/, '').trim() || name;
}

export default function ChannelCard({ channel, index, onClick }: ChannelCardProps) {
  const displayName = cleanName(channel.name);
  const isHd = /1080|720/.test(channel.quality);

  return (
    <Card className="channel-card rounded-0" onClick={() => onClick(channel)}>
      <div className="d-flex align-items-center justify-content-between px-2 pt-2">
        <span
          className="font-mono"
          style={{
            fontSize: '0.625rem',
            color: 'var(--paper-faint)',
            letterSpacing: '0.05em',
          }}
        >
          CH {String(index + 1).padStart(3, '0')}
        </span>
        {channel.quality && (
          <span className={`quality-badge ${isHd ? 'hd' : ''}`}>
            {channel.quality}
          </span>
        )}
      </div>

      <div className="card-logo-wrap mx-2 my-2">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="ch-name"
          style={{
            display: channel.logo ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '0.75rem',
            color: 'var(--paper-dim)',
            textAlign: 'center',
            padding: '0 0.5rem',
          }}
        >
          {displayName}
        </div>
      </div>

      <Card.Body className="pt-1 pb-2 px-2">
        <div className="ch-name" title={displayName}>
          {displayName}
        </div>
        <div className="ch-meta d-flex justify-content-between mt-1">
          <span>{(channel.group || 'General')}</span>
          <span>{channel.countryLabel}</span>
        </div>
      </Card.Body>
    </Card>
  );
}
