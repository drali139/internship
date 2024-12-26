import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle, camera, close, shareSocial, image } from 'ionicons/icons'; 
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({
  'close-circle': closeCircle,
  'camera': camera,
  'close': close,
  'share-social': shareSocial,
  'image' : image
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
