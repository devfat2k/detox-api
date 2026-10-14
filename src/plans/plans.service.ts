import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PlansService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('plans')
      .select('*');

    if (error) {
      throw new InternalServerErrorException(
        `Lỗi khi truy vấn danh sách gói lộ trình: ${error.message}`,
      );
    }

    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `Không tìm thấy gói lộ trình với slug: "${slug}"`,
      );
    }

    return data;
  }
}
