# Quy tắc DTO & Validation

- Mọi dữ liệu đầu vào từ client (Body, Query, Param) đều phải có class DTO định nghĩa rõ ràng.
- Sử dụng class-validator: @IsString(), @IsNumber(), @IsArray(), @IsOptional(), @IsEnum()...
- Tránh dùng type/interface chay cho dữ liệu nhận vào controller.
