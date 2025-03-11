import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly WEBAPP_URL = environment.googleWebAppUrl;

  constructor(private http: HttpClient) {}

  appendRow(rowData: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain'
    });

    return this.http.post(
      this.WEBAPP_URL,
      JSON.stringify({ rowData }),
      { headers }
    );
  }
} 