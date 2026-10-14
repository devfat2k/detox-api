import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDrinkDto } from './create-drink.dto';
import { FilterDrinkDto } from './filter-drink.dto';
import { UpdateDrinkDto } from './update-drink.dto';

@Injectable()
export class DrinksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filter?: FilterDrinkDto) {
    let query = this.supabaseService
      .getClient()
      .from('drinks')
      .select('*, categories(id, name, slug)');

    if (filter?.category_id) {
      query = query.eq('category_id', filter.category_id);
    }

    if (filter?.target_goal) {
      query = query.contains('target_goals', [filter.target_goal]);
    }

    if (filter?.is_detox_core !== undefined) {
      query = query.eq('is_detox_core', filter.is_detox_core);
    }

    const { data, error } = await query.order('level', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('drinks')
      .select('*, categories(id, name, slug)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy thức uống với slug: ${slug}`);
    }

    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('drinks')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy thức uống với ID: ${id}`);
    }

    return data;
  }

  async create(createDrinkDto: CreateDrinkDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('drinks')
      .insert([createDrinkDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async update(id: string, updateDrinkDto: UpdateDrinkDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('drinks')
      .update(updateDrinkDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('drinks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }
    return { message: `Thức uống với ID ${id} đã được xóa thành công.` };
  }
}
