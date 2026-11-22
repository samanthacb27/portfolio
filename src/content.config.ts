// =====================================================================
// CONTENT SETTINGS: describes the "shape" of each magazine file in
// src/content/editorial/. If a required field (like the cover's alt text)
// is missing, the site tells you exactly what to fix instead of breaking quietly.
// =====================================================================
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const editorial = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/editorial' }),
  schema: ({ image }) =>
    z.object({
      // Used for the viewer's screen-reader label and for search. It is NOT shown under the cover.
      title: z.string(),
      // Position in the row of covers: 1 is first (leftmost).
      order: z.number().default(100),
      // "flipbook" = clicking the cover opens the magazine.
      // "in-progress" = just the cover, nothing to click.
      status: z.enum(['flipbook', 'in-progress']),
      // The cover image, and a required description of it for people using screen readers.
      cover: image(),
      coverAlt: z.string().min(1, 'Every cover needs alt text (a short description of the image).'),
      // Optional. Normally the pages live in public/flipbooks/<this file's name>/.
      // Set this only if the folder has a different name.
      pagesFolder: z.string().optional(),
    }),
});

   const graphicDesign = defineCollection({
     loader: glob({ pattern: '**/*.md', base: './src/content/graphic-design' }),
     schema: ({ image }) =>
       z.object({
         title: z.string(),
         year: z.number(),
         order: z.number().default(100),
         cover: image(),
         coverAlt: z.string().min(1, 'Every cover needs alt text (a short description of the image).'),
         slides: z
           .array(
             z.object({
               image: image(),
               alt: z.string().min(1, 'Every slide needs alt text (a short description of the image).'),
               caption: z.string().optional(),
             })
           )
           .default([]),
         tags: z.array(z.string()).default([]),
         featured: z.boolean().default(false),
       }),
   });
const musings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/musings' }),
  schema: ({ image }) =>
    z
      .object({
        type: z.enum(['longform', 'flash']),
        title: z.string().nullish(),
        subtitle: z.string().optional(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        date: z.coerce.date(),
      })
      .refine((d) => d.type !== 'longform' || !!d.title, {
        message: 'A longform post needs a title.',
        path: ['title'],
      })
      .refine((d) => d.type !== 'longform' || !!d.cover, {
        message: 'A longform post needs a cover image.',
        path: ['cover'],
      })
      .refine((d) => d.type !== 'longform' || !!d.subtitle, {
        message: 'A longform post needs a subtitle.',
        path: ['subtitle'],
      })
      .refine((d) => !d.cover || !!d.coverAlt, {
        message: 'Every image needs alt text (a short description of the image).',
        path: ['coverAlt'],
      }),
});
const play = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/play' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.number(),
      kind: z.enum(['art', 'animation', 'other']).default('other'),
      order: z.number().default(100),
      cover: image(),
      coverAlt: z.string().min(1, 'Every cover needs alt text (a short description of the image).'),
      coverInOverlay: z.boolean().default(true),
      slides: z
        .array(
          z
            .object({
              image: image().optional(),
              video: z.string().optional(),
              poster: image().optional(),
              alt: z.string().min(1, 'Every slide needs alt text (a short description of the image or video).'),
              caption: z.string().optional(),
            })
            .refine((s) => !!s.image || (!!s.video && !!s.poster), {
              message: 'Each slide needs an image, or a video plus a poster image.',
            })
        )
        .default([]),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    }),
});
export const collections = { editorial, graphicDesign, musings, play};
