import { defineCollection, type ImageFunction } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { countSentences } from './lib/content-rules.ts';

// Schemas mirror specs/001-portfolio-site/data-model.md. Invalid content is a build error.

/** Content image: `alt` is required unless the image is explicitly decorative (FR-025). */
export const imageSchema = (image: ImageFunction) =>
  z
    .strictObject({
      src: image(),
      alt: z.string(),
      decorative: z.boolean().optional(),
    })
    .refine((img) => img.decorative === true || img.alt.trim().length > 0, {
      message: 'Image `alt` must describe the image (or set `decorative: true`).',
      path: ['alt'],
    });

const hostIs = (...hosts: string[]) =>
  z.url().refine((value) => hosts.includes(new URL(value).hostname), {
    message: `URL host must be one of: ${hosts.join(', ')}`,
  });

const education = z.strictObject({
  institution: z.string().min(1),
  credential: z.string().min(1),
  period: z.string().min(1),
  details: z.string().optional(),
});

const experience = z.strictObject({
  organization: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  summary: z.string().min(1).max(400),
  highlights: z.array(z.string().min(1)).max(5).optional(),
});

const skillGroup = z.strictObject({
  group: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

// Strict: unknown keys such as `phone` or `address` fail the build (FR-036).
const profile = defineCollection({
  loader: file('src/data/profile.yaml'),
  schema: z.strictObject({
    name: z.string().min(1).max(80),
    role: z.string().min(1).max(120),
    strengths: z.array(z.string().min(1).max(60)).min(2).max(4),
    bio: z.string().min(1).max(1200),
    location: z.string().max(80).optional(),
    seeking: z.string().max(300).optional(),
    education: z.array(education).min(1),
    experience: z.array(experience).min(1),
    skills: z.array(skillGroup).min(1),
    resume: z.string().regex(/^\/.+\.pdf$/, 'resume must be a root-relative path ending in .pdf'),
    contact: z.strictObject({
      email: z.email(),
      github: hostIs('github.com'),
      linkedin: hostIs('linkedin.com', 'www.linkedin.com'),
    }),
  }),
});

// The one shared navigation list (FR-030). Duplicate ids/orders are rejected in SiteNav.astro.
const nav = defineCollection({
  loader: file('src/data/nav.yaml'),
  schema: z.strictObject({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
    label: z.string().min(1).max(16),
    href: z.string().regex(/^\/$|^\/.+\/$/, 'href must be root-relative and end with "/"'),
    order: z.number().int(),
  }),
});

// One Markdown file per project; the body becomes /projects/<id>/ when `detail: true` (FR-033).
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .strictObject({
        title: z.string().min(1).max(80),
        summary: z
          .string()
          .max(400)
          .refine((text) => {
            const sentences = countSentences(text);
            return sentences >= 1 && sentences <= 3;
          }, 'summary must be 1 to 3 sentences (FR-009)'),
        tech: z.array(z.string().min(1).max(30)).min(1, 'list at least one technology (FR-009)'),
        links: z
          .array(
            z.strictObject({
              type: z.enum(['repository', 'demo', 'writeup', 'publication']),
              url: z.url(),
              label: z.string().min(1).optional(),
            }),
          )
          .min(1, 'add at least one link (FR-009)'),
        image: imageSchema(image).optional(),
        period: z.string().min(1).optional(),
        featured: z.boolean().default(false),
        order: z.number().int(),
        detail: z.boolean().default(false),
        detailDescription: z.string().min(50).max(160).optional(),
      })
      .refine((project) => !project.detail || project.detailDescription !== undefined, {
        message: 'detailDescription (50–160 characters) is required when detail: true',
        path: ['detailDescription'],
      }),
});

// One Markdown file per interest; the body is the write-up (FR-016, FR-020). Media are images
// stored on the site plus plain outbound links, never embeds (FR-035).
const interests = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/interests' }),
  schema: ({ image }) =>
    z.strictObject({
      title: z.string().min(1).max(80),
      category: z.string().min(1).max(40).optional(),
      images: z.array(imageSchema(image)).max(6).optional(),
      links: z
        .array(
          z.strictObject({
            type: z.enum(['video', 'audio', 'writing', 'other']),
            url: z.url(),
            label: z.string().min(1),
          }),
        )
        .optional(),
      order: z.number().int(),
    }),
});

export const collections = { profile, nav, projects, interests };
