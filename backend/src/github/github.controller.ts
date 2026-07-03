import { Controller, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get(':username/profile')
  getProfile(@Param('username') username: string) {
    return this.githubService.getProfile(username);
  }

  @Get(':username/repos')
  getRepos(@Param('username') username: string, @Query('limit') limit?: string) {
    return this.githubService.getRepos(username, limit ? parseInt(limit, 10) : undefined);
  }

  @Get(':username/summary')
  getSummary(@Param('username') username: string) {
    return this.githubService.getSummary(username);
  }
}
