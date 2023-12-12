import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment.development";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  private PK_STRIPE = environment.PK_DEV_STRIPE;
  private paymentHandler: any = null;
  public paymentMessageShown: boolean = false;
  public paymentMessageSuccess: boolean = false;
  public paymentMessageText: string = '';
  public productList: any[] = [
    {
      name: 'Petit poney',
      amount: 25,
      description: 'Description du petit poney',
      currency: 'EUR',
    },
    {
      name: 'Poney moyen',
      amount: 40,
      description: 'Description du poney moyen',
      currency: 'EUR',
    },
    {
      name: 'Gros poney',
      amount: 100,
      description: 'Description du gros poney',
      currency: 'EUR',
    },
  ];

  constructor(private http: HttpClient) {}

  // 1
  ngOnInit() {
    this.loadStripeScript();
  }


  // 3.5
  public initializePayment(product: any) {
    this.paymentHandler.open({
      name: product.name,
      description: 'Paiement par Stripe',
      amount: product.amount * 100,
      currency: product.currency,
    });
  }

  // 4
  private processPayment(product: any, stripeToken: any) {
    if (!product || !stripeToken) {
      console.error('Product or Stripe token is missing');
      this.updatePaymentMessage('Error: Invalid payment details', false);
      return;
    }

    const paymentData = {
      description: product.description,
      amount: product.amount * 100,
      currency: product.currency,
      stripeToken: stripeToken.id
    };

    this.http.post('http://localhost:3000/api/payment', paymentData)
      .subscribe({
        next: (response) => {
          console.log('Payment successful', response);
          this.updatePaymentMessage('Payment was successful', true);
        },
        error: (error) => {
          console.error('Payment failed', error);
          this.updatePaymentMessage(error.error.message || 'Payment failed', false);
        }
      });
  }

  // 5
  private updatePaymentMessage(message: string, isSuccess: boolean) {
    this.paymentMessageShown = true;
    this.paymentMessageSuccess = isSuccess;
    this.paymentMessageText = message;
    setTimeout(() => {
      this.paymentMessageShown = false;
    }, 4000);
  }

  // 2
  private loadStripeScript() {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement('script');
      script.id = 'stripe-script';
      script.src = 'https://checkout.stripe.com/checkout.js';
      script.onload = this.initializeStripe.bind(this);
      script.onerror = () => console.error('Stripe script failed to load');
      window.document.body.appendChild(script);
    }
  }

  // 3
  private initializeStripe() {
    this.paymentHandler = (window as any).StripeCheckout.configure({
      key: this.PK_STRIPE,
      locale: 'auto',
      token: (stripeToken: any) => {
        this.processPayment(this.productList[0], stripeToken);
      }
    });
  }


}
