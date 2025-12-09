import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpService } from './@http-service/http.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weatherApi';
  constructor(private httpService: HttpService) { }

  url: string = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-065?Authorization=CWA-586EED3D-A84F-437E-9109-E4D418BC7A2D";

}
