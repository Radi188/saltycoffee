import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';
export declare class AppController {
    private readonly appService;
    private readonly supabaseService;
    constructor(appService: AppService, supabaseService: SupabaseService);
    getHello(): string;
    getSupabaseHealth(): {
        status: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
    };
}
