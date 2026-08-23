import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateChargeDto, NOTIFICATIONS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    {
      apiVersion: '2026-07-29.dahlia',
    },
  );

  constructor(private readonly configService: ConfigService, @Inject(NOTIFICATIONS_SERVICE) private readonly notificationsService: ClientProxy ) {}

  // async createCharge({ card, amount }: CreateChargeDto) {
  //   const paymentMethod = await this.stripe.paymentMethods.create({
  //     type: 'card',
  //     card,
  //   });

  //   const paymentIntent = await this.stripe.paymentIntents.create({
  //     payment_method: paymentMethod.id,
  //     amount: amount * 100,
  //     confirm: true,
  //     payment_method_types: ['card'],
  //     currency: 'usd',
  //   });

  //   return paymentIntent;
  // }

  //For stripe test card (check stripe docs for more info)
  async createCharge({ amount, email }: PaymentsCreateChargeDto) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      confirm: true,
      currency: 'usd',
      payment_method: 'pm_card_visa', //For stripe test card 
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    this.notificationsService.emit('notify_email', { email,
       text: `You payment of $${amount}  was successful` })

    return paymentIntent;
  }
}
