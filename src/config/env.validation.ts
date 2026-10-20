import { z } from 'zod';

const envSchema = z
  .object({
    // Application
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3001),

    // Supabase (bắt buộc)
    SUPABASE_URL: z.string().url('SUPABASE_URL phải là URL hợp lệ'),
    SUPABASE_KEY: z.string().min(1, 'SUPABASE_KEY không được rỗng'),

    // Cloudinary (bắt buộc)
    CLOUDINARY_CLOUD_NAME: z
      .string()
      .min(1, 'CLOUDINARY_CLOUD_NAME không được rỗng'),
    CLOUDINARY_API_KEY: z
      .string()
      .min(1, 'CLOUDINARY_API_KEY không được rỗng'),
    CLOUDINARY_API_SECRET: z
      .string()
      .min(1, 'CLOUDINARY_API_SECRET không được rỗng'),

    // Optional
    FRONTEND_URL: z.string().optional(),
    SWAGGER_ENABLED: z.string().optional(),
    SUPABASE_SECRET_KEY: z.string().optional(),
    SUPABASE_JWKS_URL: z.string().url().optional().or(z.literal('')),
  })
  .passthrough(); // Cho phép các env vars khác (VERCEL, AWS_LAMBDA_*, ...) đi qua không bị reject

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${formatted}`);
  }
  return result.data;
}
