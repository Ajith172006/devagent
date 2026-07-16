import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Save or update the calling user's profile. */
  @Put('me')
  upsert(
    @CurrentUser() uid: string,
    @Body() dto: UpsertUserDto,
  ) {
    return this.usersService.upsert(uid, dto);
  }

  /** Get the calling user's profile */
  @Get('me')
  getMe(@CurrentUser() uid: string) {
    return this.usersService.findOne(uid);
  }
}
