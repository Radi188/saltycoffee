import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('supabase-health')
  getSupabaseHealth() {
    try {
      this.supabaseService.getClient();
      return { status: 'Supabase client initialized' };
    } catch (error) {
      return { status: 'Supabase initialization failed', error: error.message };
    }
  }
}
