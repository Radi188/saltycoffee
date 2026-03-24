export class CreateEventDto {
  name: string;
  description?: string;
  start_date: string; // ISO 8601
  end_date: string;   // ISO 8601
  is_active?: boolean;
}
