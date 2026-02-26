import {ApiProperty} from '@nestjs/swagger';
export class CheckAvailabilityDto {
    @ApiProperty({
        example: 1,
        description: 'The ID of the first user in the match',
    })
    user1Id: number;
    @ApiProperty({
        example: 2,
        description: 'The ID of the second user in the match',
    })
    user2Id: number;
    @ApiProperty({
        example: 1,
        description: 'The ID of the match to check availability for',
    })
    matchId: number;
}
