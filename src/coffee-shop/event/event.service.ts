import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(activeOnly = false) {
    let query = this.db.from('events').select('*').order('start_date', { ascending: false });
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findActiveNow() {
    const now = new Date().toISOString();
    const { data, error } = await this.db
      .from('events')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Event ${id} not found`);
    return data;
  }

  async create(dto: CreateEventDto) {
    const { data, error } = await this.db
      .from('events')
      .insert({ is_active: true, ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('events')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('events').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Event ${id} deleted` };
  }
}
