import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceRepository } from './repositories/service.repository';
import { CreateServiceDto } from './dto/createService.dto';
import { JwtPayload } from '@common/types/jwtPayload.type';
import { transformToDto } from '@shared/utils/transform.util';
import { ServiceResponseDto } from './dto/serviceeResponse.dto';
import { Service } from './entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  createService(serviceData: CreateServiceDto) {
    return this.serviceRepository.create(serviceData);
  }

  async getAllServices(user: JwtPayload): Promise<ServiceResponseDto[]> {
    let services: Service[];

    if (user.role == 'ADMIN') services = await this.serviceRepository.find();
    else if (user.role == 'VIEWER')
      services = await this.serviceRepository.getServicesForUser(user.userId!);
    else throw new ForbiddenException();

    return transformToDto(ServiceResponseDto, services);
  }

  async getServiceById(id: string) {
    const service = await this.serviceRepository.findById(id);

    if (!service) throw new NotFoundException();

    return service;
  }
}
