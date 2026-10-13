// Build-time: the photos for the photo-display prototypes (/photo-lab/). Joins the hand-written
// titles and alt text (src/data/photos.json) with what scripts/prepare-photos.mjs measured
// (src/data/photos-meta.json) and the processed images (src/assets/photos/, metadata stripped).
// To add, replace or remove a photo, see the top of scripts/prepare-photos.mjs (or the README).
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import authored from '../../data/photos.json';
import measured from '../../data/photos-meta.json';

const images = import.meta.glob<{ default: ImageMetadata }>('../../assets/photos/*.jpg', { eager: true });

export type Camera = { body?: string; lens?: string; focal?: string; aperture?: string; shutter?: string; iso?: string };

export type Photo = {
  id: string;
  title: string;
  alt: string;
  image: ImageMetadata;
  width: number;
  height: number;
  /** "2021-05", when the camera recorded it. */
  taken?: string;
  camera: Camera;
  palette: { hex: string; share: number }[];
  /** The photo's most characterful colour, and its hue in degrees. */
  signature: string;
  hue: number;
  /** Where its line drawing is served (src/pages/photo-lab/traces/[id].json.ts), for the drawn displays. */
  traceUrl: string;
  /** A large WebP for the full-screen viewer, and a medium one for magnifying. */
  full: string;
  medium: string;
};

/**
 * What captions and the full-screen viewer show besides each photo's title. Every display gets its
 * captions from takenLabel and cameraParts below, so these switch them everywhere at once.
 */
/** The camera settings: body, focal length, aperture, shutter speed and ISO. */
export const SHOW_CAMERA = false;
/** The month each photo was taken. */
export const SHOW_DATE = false;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "May 2021" from "2021-05", or nothing when dates are hidden. */
export const takenLabel = (taken?: string) =>
  SHOW_DATE && taken ? `${MONTHS[Number(taken.slice(5, 7)) - 1]} ${taken.slice(0, 4)}` : '';

/** The camera settings worth a caption, in reading order; none when they are hidden. */
export const cameraParts = (camera: Camera) =>
  SHOW_CAMERA ? [camera.body, camera.focal, camera.aperture, camera.shutter, camera.iso].filter((part): part is string => Boolean(part)) : [];

export async function loadPhotos(): Promise<Photo[]> {
  // The trace stays out of the page: it is served on its own and fetched when needed.
  const meta = measured as unknown as Record<string, Omit<Photo, 'id' | 'title' | 'alt' | 'image' | 'full' | 'medium' | 'traceUrl'> & { trace: unknown }>;
  return Promise.all(
    authored.map(async ({ id, title, alt }) => {
      const module = images[`../../assets/photos/${id}.jpg`];
      if (!module || !meta[id]) throw new Error(`Photo "${id}" in src/data/photos.json has no prepared image; run scripts/prepare-photos.mjs.`);
      const image = module.default;
      const [full, medium] = await Promise.all([
        getImage({ src: image, width: Math.min(1800, image.width), format: 'webp' }),
        getImage({ src: image, width: Math.min(1200, image.width), format: 'webp' }),
      ]);
      const { trace: _trace, ...rest } = meta[id];
      return { id, title, alt, image, ...rest, full: full.src, medium: medium.src, traceUrl: `/photo-lab/traces/${id}.json` };
    }),
  );
}
