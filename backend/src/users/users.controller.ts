import { Body, Controller, Get, Headers, Put, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpsertUserDto } from './dto/upsert-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Save or update the calling user's profile. x-user-id header = Firebase UID */
  @Put('me')
  upsert(
    @Headers('x-user-id') uid: string,
    @Body() dto: UpsertUserDto,
  ) {
    if (!uid) throw new UnauthorizedException('x-user-id header is required');
    return this.usersService.upsert(uid, dto);
  }

  /** Get the calling user's profile */
  @Get('me')
  getMe(@Headers('x-user-id') uid: string) {
    if (!uid) throw new UnauthorizedException('x-user-id header is required');
    return this.usersService.findOne(uid);
  }
}
