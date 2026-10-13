# Quy tắc thao tác Database Supabase

- Inject `SupabaseService` qua constructor.
- Sử dụng `this.supabaseService.getClient().from('table_name')`.
- Luôn kiểm tra `{ data, error }` sau mỗi câu query. Nếu có error, quăng lỗi NestJS tương ứng (InternalServerErrorException hoặc BadRequestException).
