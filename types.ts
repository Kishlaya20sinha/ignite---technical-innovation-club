export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export interface AlumniMember {
  id: number;
  name: string;
  batch: string;
  image: string;
  linkedin?: string;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  category: string;
  description: string;
  image: string;
}

export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
}

export interface NavItem {
  name: string;
  path: string;
}
