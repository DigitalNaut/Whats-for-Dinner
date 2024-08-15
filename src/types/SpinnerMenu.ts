import { z } from "zod";

const spinnerEntrySchema = z.object({
  key: z.number(),
  label: z.string(),
  enabled: z.boolean(),
  imageUrl: z.string().optional(),
  fileId: z.string().optional(),
});

export const spinnerEntriesSchema = z.array(spinnerEntrySchema);

export type SpinnerEntry = z.infer<typeof spinnerEntrySchema>;
