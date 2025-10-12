import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ICategory } from '../interface';

@Injectable()
export class CategoryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> { 
    return next.handle().pipe(
      map((data: ICategory) => {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
        };
      }),
    );
  }
}
