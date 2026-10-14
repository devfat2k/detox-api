import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateCategoryDto } from './create-category.dto';

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
}
