import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryListInterceptor } from './interceptor/category-list.interceptor';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService){}

  @Get('list')
  @UseInterceptors(CategoryListInterceptor)
  async getList() {
    return this.categoryService.getList();
  }

  @Get('')
  async getListPagination(@Query() query: {page?: number, limit?: number, search?: string}) {
    return this.categoryService.listPagination(query);
  }

  @Patch(':id')
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<CreateCategoryDto>) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }

  @Post('')
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

}
