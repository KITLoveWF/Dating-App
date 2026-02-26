import {ApiProperty} from '@nestjs/swagger';
export class CreateAvailabilityDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the first user in the match',
    })
    userId: number;
    @ApiProperty({
        example: 1,
        description: 'The ID of the match to create availability for',
    })
    matchId: number;
    @ApiProperty({
        example: '2023-01-01T00:00:00.000Z',
        description: 'The start date of the match for user',
    })
    fromDate: Date;
    @ApiProperty({
        example: '2023-01-07T00:00:00.000Z',
        description: 'The end date of the match for user',
    })
    toDate: Date;
}
