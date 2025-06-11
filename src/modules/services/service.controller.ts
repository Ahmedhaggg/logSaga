import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateServiceDto } from './dto/createService.dto';
import { ServiceService } from './service.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthGuard } from '@common/guards/auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/cuurentUser.decorator';
import { JwtPayload } from '@common/types/jwtPayload.type';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @ApiBearerAuth()
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.createService(dto);
  }

  @ApiBearerAuth()
  @Roles('ADMIN', 'VIEWER')
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const services = this.serviceService.getAllServices(user);

    return { services };
  }

  @ApiBearerAuth()
  @Roles('ADMIN', 'VIEWER')
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const service = this.serviceService.getServiceById(id);

    return { service };
  }
}
