import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryListInterceptor } from './interceptor/category-list.interceptor';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService){}

  @Get('list')
  @UseInterceptors(CategoryListInterceptor)
  async getList() {
    return this.categoryService.getList();
  }
}
