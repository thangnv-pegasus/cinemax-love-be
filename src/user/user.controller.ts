import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, Request, Search, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { IUserInfo } from './interface/user';
import { UserInterceptor } from './interceptor/user.interceptor';
import { UserService } from './user.service';
import { Role } from '@/auth/decorators/role.decorator';
import { ROLE } from '@/common/constants/user';
import { RoleGuard } from '@/auth/guard/role-guard.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')  
  @UseInterceptors(UserInterceptor)
  async getUserInfo(@Request() req): Promise<IUserInfo> {
    if (!req.session.user) {
      throw new UnauthorizedException('User not logged in');
    }
    return req.session.user;
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get()
  @Role(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getList(@Query('page', ParseIntPipe) page = 1, @Query('limit', ParseIntPipe) limit = 12, @Query('search') search = '') {
    return this.userService.findList(page, limit, search);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN, ROLE.USER)
  @UseInterceptors(UserInterceptor)
  async update(@Body() dto: UpdateUserDto, @Param('id', ParseIntPipe) id: number, @Request() req) {
    if(req.user.role !== ROLE.ADMIN && req.id !== req.user.id) {
      throw new Error('You do not have permission to update this user');
    }
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
