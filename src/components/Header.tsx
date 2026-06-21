import { useState } from 'react';
import { Navbar, Container, Form, InputGroup } from 'react-bootstrap';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  reliableOnly: boolean;
  onReliableToggle: () => void;
  totalChannels: number;
  isLoading: boolean;
}

export default function Header({
  searchValue,
  onSearchChange,
  reliableOnly,
  onReliableToggle,
  totalChannels,
  isLoading,
}: HeaderProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar expanded={expanded} onToggle={() => setExpanded(!expanded)} expand="lg" className="signal-navbar" variant="dark" fixed="top">
      <Container fluid style={{ maxWidth: 1440 }}>
        <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
          <span className="logo-dot"></span>
          <div className="d-flex flex-column">
            <span style={{ lineHeight: 1.2 }}>SIGNAL</span>
            <small
              className="font-mono"
              style={{
                fontSize: '0.55rem',
                color: 'var(--paper-faint)',
                letterSpacing: '0.1em',
                fontWeight: 500,
              }}
            >
              BD &middot; IN &middot; SPORTS &middot; FIFA+ &mdash; FREE LIVE TV
            </small>
          </div>
        </Navbar.Brand>

        <div className="d-flex align-items-center gap-2 order-lg-last">
          <div className="stat-chip d-none d-md-block">
            <b>{totalChannels}</b> channels
          </div>
          <Navbar.Toggle
            aria-controls="signal-navbar-nav"
            style={{
              borderColor: 'var(--line)',
              padding: '0.375rem 0.5rem',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <Navbar.Collapse id="signal-navbar-nav">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 ms-lg-auto mt-2 mt-lg-0">
            <InputGroup style={{ maxWidth: 460, minWidth: 240 }}>
              <InputGroup.Text
                style={{
                  background: 'var(--panel)',
                  borderColor: 'var(--line)',
                  borderRight: 'none',
                  color: 'var(--paper-dim)',
                  paddingLeft: '0.875rem',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search channels... e.g. ATN, Star Sports, Zee, FIFA"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="signal-form-control"
                style={{
                  borderLeft: 'none',
                  paddingLeft: '0.5rem',
                }}
              />
            </InputGroup>

            <div
              className={`signal-toggle ${reliableOnly ? 'on' : ''}`}
              onClick={onReliableToggle}
              title="Hide channels that are unlikely to play in a browser"
              role="button"
            >
              <span className="sw"></span>
              <span className="d-none d-sm-inline">Playable only</span>
              <span className="d-sm-none">Reliable</span>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>

      <div className={`load-bar ${!isLoading ? 'done' : ''}`}>
        {isLoading && <span></span>}
      </div>
    </Navbar>
  );
}
