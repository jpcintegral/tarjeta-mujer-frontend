import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BusinessService } from '../models/business-service.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessServiceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  create(
    businessId: number | string,
    data: Partial<BusinessService>,
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/services/business/${businessId}`, {
      data,
    });
  }

  updateStatus(
    businessId: string,
    serviceId: string,
    active: boolean,
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/services/business/${businessId}/${serviceId}/status`,
      {
        active,
      },
    );
  }

  getByBusiness(businessId: number | string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/services?filters[business][documentId][$eq]=${businessId}&populate=*`,
    );
  }

  getPublicServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/public-services`);
  }

  getPublicService(documentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/public-services/${documentId}`);
  }
  update(
    businessId: number | string,
    serviceId: string,
    data: Partial<BusinessService>,
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/services/business/${businessId}/${serviceId}`,
      {
        data,
      },
    );
  }
}
