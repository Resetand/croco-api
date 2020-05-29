import { DbClient } from 'src/db/client';
import { Inject, Service } from 'typedi';

@Service()
export class GameService {
    constructor(@Inject('dbClient') private dbClient: DbClient) {}
}
