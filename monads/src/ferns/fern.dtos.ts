import z from "zod";

export type CreateFernDto = z.infer<typeof createFernDto>;
export const createFernDto = z.object({
    name: z.string().min(1),
    scientificName: z.string().min(1),
});

export type UpdateFernDto = z.infer<typeof updateFernDto>;
export const updateFernDto = z.object({
    name: z.string().min(1).optional(),
    scientificName: z.string().min(1).optional(),
})
