import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateProfileDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'The name of the user',
    }
    )
    name: string;
    @ApiProperty(
        {
            example: 30,
            description: 'The age of the user',
        }
    )
    age: number;
    @ApiProperty(
        {
            example: 'male',
            description:'The gender of the user',
        }
    )
    gender: string;
    @ApiPropertyOptional(
        {
            example: 'I am a software developer who loves hiking and traveling.',
            description: 'A short bio about the user',
        }
    )
    bio?: string;
    @ApiProperty(
        {
            example: 'https://example.com/profile-picture.jpg',
            description: 'The URL of the user\'s profile picture',
        }
    )
    email: string;
}
