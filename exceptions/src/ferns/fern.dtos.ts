import z from "zod";

export const createFernDto = z.object({
    name: z.string().min(1),
    scientificName: z.string().min(1),
});

export const updateFernDto = z.object({
    name: z.string().min(1).optional(),
    scientificName: z.string().min(1).optional(),
})
