import {ApiProperty} from '@nestjs/swagger';
export class UpdateMatchDto  {
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
}
