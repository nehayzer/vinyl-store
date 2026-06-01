export type VinylRecord = {
  id: number;
  title: string;
  artist: string;
  price: number;
  inStock: boolean;
  image: string;
  description: string;
  rating: number;
  genre: 'jazz' | 'rock' | 'electronic' | 'classical' | 'hiphop' | 'soul';
  year: number;
  label: string;
  tracklist: string;
};

export interface VinylFilterParams {
  search?: string;
  inStock?: boolean;
  genre?: string;
}
