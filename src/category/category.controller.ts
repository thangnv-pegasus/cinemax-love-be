import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryListInterceptor } from './interceptor/category-list.interceptor';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService){}

  // cú pháp định nghĩa api lấy tất cả các thể loại phim => /categories/list
  @Get('list')
  @UseInterceptors(CategoryListInterceptor)
  async getList() {
    return this.categoryService.getList();
  }

  // cú pháp định nghĩa api lấy danh sách thể loại phim phân trang => /categories?page=1&limit=12&search=abc
  @Get('')
  async getListPagination(@Query() query: {page?: number, limit?: number, search?: string}) {
    return this.categoryService.listPagination(query);
  }

  // cú pháp định nghĩa api update thông tin thể loại phim => /categories/:id
  @Patch(':id')
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<CreateCategoryDto>) {
    return this.categoryService.update(id, body);
  }

  // cú pháp định nghĩa api xóa thể loại phim => /categories/:id
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }

  // cú pháp định nghĩa api thêm mới thể loại phim => /categories
  @Post('')
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

}
