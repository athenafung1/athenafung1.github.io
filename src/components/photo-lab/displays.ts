// The photo-display prototypes at /photo-lab/<slug>/ (test branch only).
export type PhotoDisplay = {
  slug: string;
  name: string;
  /** One or two sentences: what the display is. */
  idea: string;
  /** How to use it, in a line. */
  hint: string;
};

export const PHOTO_DISPLAYS: PhotoDisplay[] = [
  {
    slug: 'contact-sheet',
    name: 'Contact sheet',
    idea: 'The photos as frames on a sheet of film, in the order they were taken, with a loupe that magnifies whatever the pointer is over.',
    hint: 'Hover a frame to look closer. Click it to see it full size with its camera settings.',
  },
  {
    slug: 'spectrum',
    name: 'Colour spectrum',
    idea: 'Each photo’s five main colours, measured when the site builds, in a band ordered by hue, with the photos below in the same order.',
    hint: 'Point at a colour stripe or a photo to find its partner. Click a photo to open it.',
  },
  {
    slug: 'harmonograph',
    name: 'Drawn by the harmonograph',
    idea: 'As each photo comes into view, spinning circles trace the outline of its main shape, like the Fourier sketch, and then the photo develops underneath.',
    hint: 'Scroll to draw each photo. Press Redraw to watch it again, or click a photo to open it.',
  },
  {
    slug: 'light-table',
    name: 'Light table',
    idea: 'Prints scattered across a table, a little askew and overlapping, to shuffle around by hand.',
    hint: 'Drag the prints around. Click one to open it.',
  },
  {
    slug: 'film-strip',
    name: 'Film strip',
    idea: 'One reel of film that snaps from frame to frame, each frame captioned along its edge like film stock.',
    hint: 'Swipe or scroll sideways, use the arrow keys, or press Previous and Next.',
  },
  {
    slug: 'film-drawn',
    name: 'Film strip, drawn',
    idea: 'The film strip with the harmonograph: frames still to come are blank paper marked with the site’s rose, and the one you stop on is drawn by spinning circles before it develops. Every photo added to the list joins the reel.',
    hint: 'Swipe or scroll sideways, or use the arrow keys. Stop on a frame to watch it drawn; Redraw replays it.',
  },
  {
    slug: 'justified',
    name: 'Justified rows',
    idea: 'Photos at their own shapes, packed into even rows that fill the width, with a full-screen viewer.',
    hint: 'Click a photo to open it, then use the arrow keys to move through them.',
  },
];
