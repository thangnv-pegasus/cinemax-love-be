import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto } from './dto/create.dto';
import { GetListWishlistDto } from './dto/list.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post('')
  async addToWishlist(@Body() body: CreateWishlistItemDto) {
    return this.wishlistService.addToWishlist(body.userId, body.filmId);
  }

  @Get(':userId')
  async getWishlistByUser(@Param('userId', ParseIntPipe) userId: number, @Query() query: GetListWishlistDto) {
    return this.wishlistService.getWishlistByUser(userId, query);
  }

  @Delete('')
  async removeFromWishlist(@Body() body: CreateWishlistItemDto) {
    return this.wishlistService.removeFromWishlist(body.userId, body.filmId);
  }
}
