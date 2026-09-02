import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { NotificationsServiceControllerMethods, NotificationsServiceController } from '@app/common';

@Controller()
@NotificationsServiceControllerMethods()
export class NotificationsController implements NotificationsServiceController {
  constructor(private readonly notificationsService: NotificationsService) {}

 @UsePipes(new ValidationPipe()) 
 async notifyEmail(data: NotifyEmailDto) {
  this.notificationsService.notifyEmail(data)
 }
} 
 