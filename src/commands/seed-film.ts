import { Command, CommandRunner, Option } from 'nest-commander';
import { FilmService } from '../film/film.service';

@Command({
  name: 'fetch:films',
  description: 'Fetch and store films by category slug',
})
export class FetchFilmsCommand extends CommandRunner {
  constructor(private readonly fetchFilmService: FilmService) {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    const category = passedParams[0] || 'phim-bo';
    const page = passedParams[1] || 1;
    await this.fetchFilmService.fetchAndStoreFilms(category, +page);
    console.log(`✅ Imported films for category "${category}"`);
  }
}
