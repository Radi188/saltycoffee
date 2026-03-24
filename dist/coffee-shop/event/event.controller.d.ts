import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    findAll(activeOnly?: string): Promise<any[]>;
    findActiveNow(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateEventDto): Promise<any>;
    update(id: string, dto: UpdateEventDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
