import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ICategory } from '../interface';

@Injectable()
export class CategoryListInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> { 
    return next.handle().pipe(
      map((data: ICategory[]) => {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
        }));
      }),
    );
  }
}
