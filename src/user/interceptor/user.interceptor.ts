import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUserInfo } from '../interface/user';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: IUserInfo) => {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }),
    );
  }
}
