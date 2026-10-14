import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*');

    if (error) {
      throw new InternalServerErrorException(
        `Error fetching categories: ${error.message}`,
      );
    }

    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Category with slug "${slug}" not found.`);
    }

    return data;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .insert(createCategoryDto)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creating category: ${error.message}`,
      );
    }

    return data;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .update(updateCategoryDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error updating category: ${error.message}`,
      );
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(
        `Error deleting category: ${error.message}`,
      );
    }

    return { message: `Danh mục với ID ${id} đã được xóa thành công.` };
  }
}
