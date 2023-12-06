import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GetUser } from '../../common/decorators';
import { HttpUser } from '../../types';
import { JwtAuthGuard } from '../../modules/domain/auth';
import { IClientService, Types as TClient } from '../../modules/domain/clients';
import { IGameService, Types as TExtApi } from '../../modules/externalApi';
import { IGHubLogger, Types as TLog } from '../../modules/core/logging';

import * as dto from './clientDto';


@ApiBearerAuth('Bearer')
@ApiTags('client')
@UseGuards(JwtAuthGuard)
@Controller('/v1/idp/clients')
export class ClientController {
	constructor(
		@Inject(TClient.CLIENT_SVC) private readonly _clientSvc: IClientService,
		@Inject(TExtApi.GAME_SVC) private readonly _gameSvc: IGameService,
		@Inject(TLog.LOGGER_SVC) private readonly _logger: IGHubLogger,
	) {}

	@Get()
	public async getAll() {
		return await this._clientSvc.find({});
	}

	@Get(':id')
	public async getByGame(@Param('id') id: string) {
		return await this._clientSvc.findOne({ clientId: id });
	}

	@Post()
	public async create(@Body() createClientDto: dto.CreateClientDto) {
		// validate user permission
		await this._validateGame(createClientDto.clientId);
		const { scope: reqScp, ...createClientParam } = createClientDto;
		const scope = reqScp.join(' ');
		return await this._clientSvc.create({
			...createClientParam,
			scope,
		});
	}

	private async _validateGame(gameId: string) {
		try {
			const game = await this._gameSvc.getGame(gameId);
			this._logger.log(`Get game:${gameId} successful`, game);
		}
		catch (err) {
			this._logger.error('Get game error', err);
			throw new NotFoundException('Game not found');
		}
	}

	@Put(':id')
	public async update(
	@Param('id') id: string,
		@Body() updateClientDto: dto.UpdateClientDto,
	) {
		const { scope: reqScp, ...updateClientParam } = updateClientDto;
		const scope = reqScp?.join(' ');
		return await this._clientSvc.update(id, {
			scope,
			...updateClientParam,
		});
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@GetUser() user: HttpUser, @Param('id') id: string) {
		await this._clientSvc.delete(id);
	}
}