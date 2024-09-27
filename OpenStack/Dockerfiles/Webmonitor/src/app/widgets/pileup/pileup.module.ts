import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { DataService } from '../array-snapshot/data.service';
import { PileupComponent } from './pileup.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    declarations: [PileupComponent]
})
export class PileupModule {
    static entry = PileupComponent;
}
