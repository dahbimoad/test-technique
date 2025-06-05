import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';

/**
 * DTO for updating an existing tag
 * Inherits all properties from CreateTagDto but makes them optional
 */
export class UpdateTagDto extends PartialType(CreateTagDto) {}
