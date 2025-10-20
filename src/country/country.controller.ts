import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';

@Controller('countries')
export class CountryController {
  constructor(private countryService: CountryService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    return this.countryService.getAll();
  }
}
