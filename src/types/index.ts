export interface Channel {
  name: string;
  logo: string;
  group: string;
  tvgId: string;
  quality: string;
  country: string;
  countryLabel: string;
  url: string;
  isHttps: boolean;
}

export interface Source {
  key: string;
  url: string;
  label: string;
}

export interface FifaPlusStream {
  name: string;
  region: string;
  desc: string;
  streamUrl: string;
  quality: string;
  language: string;
}

export interface WorldCupBroadcaster {
  name: string;
  desc: string;
  embedUrl: string;
  directUrl: string;
}
